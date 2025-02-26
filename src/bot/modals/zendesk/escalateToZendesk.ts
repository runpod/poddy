import { env } from "node:process";
import { MessageFlags } from "@discordjs/core";
import type { APIMessage, APIModalSubmitGuildInteraction, APIThreadChannel } from "@discordjs/core";
import type Language from "../../../../lib/classes/Language.js";
import Modal from "../../../../lib/classes/Modal.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { ZendeskUploadResponse } from "../../../../typings/zendesk.js";
import { submitTicket } from "../../../utils/zendesk.js";

export default class EscalateToZendesk extends Modal {
	/**
	 * Create our escalate to Zendesk modal.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
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

		const user = await this.client.api.users.get(userId);
		const email = interaction.data.components[0]!.components[0]!.value;

		if (type === "message") {
			const message = await this.client.api.channels.getMessage(interaction.channel!.id, id);

			const uploadTokens = await Promise.all(
				message.attachments.map(async (attachment) => {
					const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

					const response = await fetch(
						`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
						{
							headers: {
								Authorization: `Basic ${env.ZENDESK_API_KEY}`,
								"Content-Type": attachment.content_type!,
							},
							body: buffer,
							method: "POST",
						},
					);

					const data: ZendeskUploadResponse = await response.json();

					return data.upload.token;
				}),
			);

			await submitTicket(this.client, type, email, user, interaction, {
				comment: {
					html_body: `${user.username} [${user.id}] escalated 
					<a href="https://discord.com/channels/${interaction.guild_id!}/${message.channel_id}/${message.id}">this message</a> 
					from Discord:
					\n\n${message.author.username} [${message.author.id}]: ${message.content}`,
					uploads: uploadTokens,
				},
			});
		}

		const thread = (await this.client.api.channels.get(id)) as APIThreadChannel;

		const data = await submitTicket(this.client, type, email, user, interaction, {
			comment: {
				html_body: `${user.username} [${user.id}] escalated 
				<a href="https://discord.com/channels/${thread.guild_id!}/${thread.id}">this thread</a>
				from Discord, all messages in the thread are included below as internal notes.`,
			},
		});

		if (!data) return;

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

		for (const message of allMessages) {
			const uploadTokens = await Promise.all(
				message.attachments.map(async (attachment) => {
					const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

					const response = await fetch(
						`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
						{
							headers: {
								Authorization: `Basic ${env.ZENDESK_API_KEY}`,
								"Content-Type": attachment.content_type!,
							},
							body: buffer,
							method: "POST",
						},
					);

					const data: ZendeskUploadResponse = await response.json();

					return data.upload.token;
				}),
			);

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

			if (commentResponse.status !== 200) {
				await this.client.logger.sentry.captureWithExtras(
					new Error(
						`Zendesk Ticket Comment Failed With Status ${commentResponse.status} (${commentResponse.statusText})`,
					),
					{
						response: commentResponse,
					},
				);
			}
		}
	}
}
