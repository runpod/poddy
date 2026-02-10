import { env } from "node:process";
import type { APIMessage, APIModalSubmitGuildInteraction, APIThreadChannel } from "@discordjs/core";
import { ComponentType, MessageFlags } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import type Language from "@lib/classes/Language.js";
import Modal from "@lib/classes/Modal.js";
import type { PoddyClient } from "@src/client";
import type { ZendeskUploadResponse } from "@src/typings/zendesk.js";

export default class EscalateToZendesk extends Modal<PoddyClient> {
	/**
	 * Create our escalate to Zendesk modal.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: PoddyClient) {
		super(client, {
			name: "escalateToZendesk",
		});
	}

	public override async run({
		interaction,
	}: {
		interaction: APIModalSubmitGuildInteraction;
		language: Language;
		shardId: number;
	}) {
		await this.client.api.interactions.defer(interaction.id, interaction.token, {
			flags: MessageFlags.Ephemeral,
		});

		const [_, type, id, userId] = interaction.data.custom_id.split(".") as [
			string,
			"message" | "thread",
			string,
			string,
		];

		const lang = this.client.languageHandler.getLanguage("en-US");

		let user;
		try {
			user = await this.client.api.users.get(userId);
		} catch (error) {
			const eventId = await this.client.logger.sentry.captureWithExtras(
				error instanceof Error ? error : new Error("Failed to fetch user for escalation"),
				{ userId, type, id },
			);

			return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: lang.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
						description: lang.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
						footer: { text: lang.get("SENTRY_EVENT_ID_FOOTER", { eventId }) },
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		const email = interaction.data.components
			.filter((component) => component.type === ComponentType.ActionRow)
			.flatMap((row) => row.components)
			.find((component) => component.type === ComponentType.TextInput)?.value;

		if (type === "message") {
			let message;
			try {
				message = await this.client.api.channels.getMessage(interaction.channel!.id, id);
			} catch (error) {
				const eventId = await this.client.logger.sentry.captureWithExtras(
					error instanceof Error ? error : new Error("Failed to fetch message for escalation"),
					{ channelId: interaction.channel!.id, messageId: id },
				);

				return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
					embeds: [
						{
							title: lang.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
							description: lang.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
							footer: { text: lang.get("SENTRY_EVENT_ID_FOOTER", { eventId }) },
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
				});
			}

			const uploadTokens = await this.uploadAttachmentsToZendesk(message.attachments);

			await this.client.functions.submitTicket(type, email, user, interaction, {
				comment: {
					html_body: `${user.username} [${user.id}] escalated 
					<a href="https://discord.com/channels/${interaction.guild_id!}/${message.channel_id}/${message.id}">this message</a> 
					from Discord:
					\n\n${message.author.username} [${message.author.id}]: ${message.content}`,
					uploads: uploadTokens,
				},
			});

			return;
		}

		let thread: APIThreadChannel;
		try {
			thread = (await this.client.api.channels.get(id)) as APIThreadChannel;
		} catch (error) {
			// Handle case where thread/channel no longer exists
			if (error instanceof DiscordAPIError && error.code === 10003) {
				return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
					embeds: [
						{
							title: lang.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
							description: lang.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
				});
			}

			const eventId = await this.client.logger.sentry.captureWithExtras(
				error instanceof Error ? error : new Error("Failed to fetch thread for escalation"),
				{ threadId: id },
			);

			return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: lang.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
						description: lang.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
						footer: { text: lang.get("SENTRY_EVENT_ID_FOOTER", { eventId }) },
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		const data = await this.client.functions.submitTicket(type, email, user, interaction, {
			comment: {
				html_body: `${user.username} [${user.id}] escalated 
				<a href="https://discord.com/channels/${thread.guild_id!}/${thread.id}">this thread</a>
				from Discord, all messages in the thread are included below as internal notes.`,
			},
		});

		if (!data) return;

		const allMessages = await this.fetchAllThreadMessages(thread);

		for (const message of allMessages) {
			const uploadTokens = await this.uploadAttachmentsToZendesk(message.attachments);

			const commentResponse = await fetch(`https://runpodinc.zendesk.com/api/v2/tickets/${data.ticket.id}.json`, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${env.ZENDESK_API_KEY}`,
				},
				body: JSON.stringify({
					ticket: {
						comment: {
							body: `${message.author.username} [${message.author.id}]: ${message.content}`,
							uploads: uploadTokens,
							public: false,
						},
					},
				}),
				method: "PUT",
			});

			if (!commentResponse.ok) {
				throw new Error(
					`Zendesk Ticket Comment Failed With Status ${commentResponse.status} (${commentResponse.statusText})`,
				);
			}
		}
	}

	/**
	 * Upload attachments to Zendesk and return the upload tokens.
	 */
	private async uploadAttachmentsToZendesk(
		attachments: { url: string; filename: string; content_type?: string | null }[],
	): Promise<string[]> {
		return Promise.all(
			attachments.map(async (attachment) => {
				const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

				const response = await fetch(
					`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
					{
						headers: {
							Authorization: `Basic ${env.ZENDESK_API_KEY}`,
							"Content-Type": attachment.content_type ?? "application/octet-stream",
						},
						body: buffer,
						method: "POST",
					},
				);

				if (!response.ok) {
					throw new Error(
						`Zendesk Upload Failed With Status ${response.status} (${response.statusText}) for ${attachment.filename}`,
					);
				}

				const data: ZendeskUploadResponse = await response.json();
				return data.upload.token;
			}),
		);
	}

	/**
	 * Fetch all messages from a thread, excluding bot messages.
	 */
	private async fetchAllThreadMessages(thread: APIThreadChannel): Promise<APIMessage[]> {
		const allMessages: APIMessage[] = [];

		let messages = await this.client.api.channels.getMessages(thread.id, {
			limit: 100,
		});

		allMessages.push(...messages.filter((message) => !message.author.bot));

		this.client.logger.info(
			`Fetched ${messages.length} initial messages for thread ${thread.name} (${thread.id}) while escalating thread to ZenDesk.`,
		);

		while (messages.length === 100) {
			messages = await this.client.api.channels.getMessages(thread.id, {
				limit: 100,
				before: messages[messages.length - 1]!.id,
			});

			allMessages.push(...messages.filter((message) => !message.author.bot));

			this.client.logger.info(
				`Fetched ${messages.length} additional messages (${allMessages.length} total) for thread ${thread.name} (${thread.id}) while escalating thread to ZenDesk.`,
			);
		}

		allMessages.reverse();
		return allMessages;
	}
}
