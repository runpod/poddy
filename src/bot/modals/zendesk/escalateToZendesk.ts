import { DiscordAPIError } from "@discordjs/rest";
import type Language from "@lib/classes/Language.js";
import Modal from "@lib/classes/Modal.js";
import type { PoddyClient } from "@src/client";
import {
	type APIModalSubmitGuildInteraction,
	type APIThreadChannel,
	ComponentType,
	MessageFlags,
	RESTJSONErrorCodes,
} from "discord-api-types/v10";

export default class EscalateToZendesk extends Modal<PoddyClient> {
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

			const uploadTokens = await this.client.functions.uploadAttachmentsToZendesk(message.attachments);

			await this.client.functions.submitTicket(type, email, user, id, interaction as any, {
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
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) {
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

		const data = await this.client.functions.submitTicket(type, email, user, id, interaction as any, {
			comment: {
				html_body: `${user.username} [${user.id}] escalated 
				<a href="https://discord.com/channels/${thread.guild_id!}/${thread.id}">this thread</a>
				from Discord, all messages in the thread are included below as internal notes.`,
			},
		});

		if (!data) return;

		const allMessages = await this.client.functions.fetchAllThreadMessages(thread.id, {
			excludeBots: true,
			sortOrder: "chronological",
		});

		for (const message of allMessages) {
			await this.client.functions.addTicketInternalNote(data.ticket.id, message);
		}
	}
}
