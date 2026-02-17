import Button from "@lib/classes/Button.js";
import type Language from "@lib/classes/Language.js";
import PermissionsBitField from "@lib/utilities/permissions.js";
import type { PoddyClient } from "@src/client.js";
import { query, USER_BY_DISCORD_ID_QUERY, type UserByDiscordIdResult } from "@src/utilities/graphql.js";
import {
	type APIMessageComponentButtonInteraction,
	type APIThreadChannel,
	ComponentType,
	MessageFlags,
	PermissionFlagsBits,
	TextInputStyle,
} from "discord-api-types/v10";

export default class EscalateToZendesk extends Button<PoddyClient> {
	public constructor(client: PoddyClient) {
		super(client, {
			name: "escalateToZendesk",
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIMessageComponentButtonInteraction;
		language: Language;
		shardId: number;
	}) {
		const [_, type, id, staffUserId, escalatedUserId] = interaction.data.custom_id.split(".") as [
			string,
			"message" | "thread",
			string,
			string,
			string,
		];

		if (
			escalatedUserId !== interaction.member!.user.id &&
			!PermissionsBitField.has(BigInt(interaction.member!.permissions), PermissionFlagsBits.ViewAuditLog)
		) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("ESCALATION_FOR_ANOTHER_USER_TITLE"),
						description: language.get("ESCALATION_FOR_ANOTHER_USER_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		const existingTicket = await this.client.prisma.zendeskTicket.findUnique({
			where: { escalatedId: id },
		});

		if (existingTicket)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TICKET_ALREADY_EXISTS_TITLE"),
						description: language.get("TICKET_ALREADY_EXISTS_DESCRIPTION", {
							ticketId: existingTicket.id,
						}),
						color: this.client.config.colors.success,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		// Check if the escalated user has a linked RunPod account
		const runpodUser = await this.lookupRunpodEmail(escalatedUserId);

		if (runpodUser?.email) {
			await this.client.api.interactions.defer(interaction.id, interaction.token, {
				flags: MessageFlags.Ephemeral,
			});

			await this.processEscalation(type, id, runpodUser.email, staffUserId, interaction);
			return;
		}

		return this.client.api.interactions.createModal(interaction.id, interaction.token, {
			title: language.get("OPEN_ZENDESK_TICKET_BUTTON_LABEL"),
			custom_id: interaction.data.custom_id,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.TextInput,
							custom_id: "email",
							label: language.get("ESCALATE_TO_ZENDESK_EMAIL_LABEL"),
							style: TextInputStyle.Short,
							placeholder: language.get("ESCALATE_TO_ZENDESK_EMAIL_PLACEHOLDER"),
							required: true,
						},
					],
				},
			],
		});
	}

	private async lookupRunpodEmail(discordId: string): Promise<{ email: string } | null> {
		try {
			const response: UserByDiscordIdResult = await query(USER_BY_DISCORD_ID_QUERY, {
				input: { discordId },
			});
			return response.data?.userByDiscordId ?? null;
		} catch {
			return null;
		}
	}

	private async processEscalation(
		type: "message" | "thread",
		id: string,
		email: string,
		staffUserId: string,
		interaction: APIMessageComponentButtonInteraction,
	) {
		const lang = this.client.languageHandler.getLanguage("en-US");

		let staffUser;
		try {
			staffUser = await this.client.api.users.get(staffUserId);
		} catch (error) {
			const eventId = await this.client.logger.sentry.captureWithExtras(
				error instanceof Error ? error : new Error("Failed to fetch user for escalation"),
				{ staffUserId, type, id },
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
			});
		}

		if (type === "message") {
			const message = await this.client.api.channels.getMessage(interaction.channel!.id, id);
			const uploadTokens = await this.client.functions.uploadAttachmentsToZendesk(message.attachments);

			await this.client.functions.submitTicket(type, email, staffUser, id, interaction as any, {
				comment: {
					html_body: `${staffUser.username} [${staffUser.id}] escalated 
					<a href="https://discord.com/channels/${interaction.guild_id!}/${message.channel_id}/${message.id}">this message</a> 
					from Discord:
					\n\n${message.author.username} [${message.author.id}]: ${message.content}`,
					uploads: uploadTokens,
				},
			});

			return;
		}

		const thread = (await this.client.api.channels.get(id)) as APIThreadChannel;

		const data = await this.client.functions.submitTicket(type, email, staffUser, id, interaction as any, {
			comment: {
				html_body: `${staffUser.username} [${staffUser.id}] escalated 
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
