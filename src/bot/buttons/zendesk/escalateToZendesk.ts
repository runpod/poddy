import {
	type APIMessageComponentButtonInteraction,
	ComponentType,
	MessageFlags,
	PermissionFlagsBits,
	TextInputStyle,
} from "@discordjs/core";
import { BitField } from "@sapphire/bitfield";
import Button from "../../../../lib/classes/Button.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import PermissionsBitField from "../../../../lib/utilities/permissions.js";

export default class EscalateToZendesk extends Button {
	/**
	 * Create our escalate to Zendesk button.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "escalateToZendesk",
		});
	}

	/**
	 * Run this button.
	 *
	 * @param options The options to run this button.
	 * @param options.interaction The interaction that triggered this button.
	 * @param options.language The language to use when replying to the interaction.
	 * @param options.shardId The shard ID to use when replying to the interaction.
	 */
	public override async run({
		interaction,
		language,
	}: {
		interaction: APIMessageComponentButtonInteraction;
		language: Language;
		shardId: number;
	}) {
		const [_, __, id, ____, escalatedUserId] = interaction.data.custom_id.split(".") as [
			string,
			"message" | "thread",
			string,
			string,
			string,
		];

		if (
			escalatedUserId !== interaction.member!.user.id ||
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

		const ticket = await this.client.prisma.zendeskTicket.findUnique({
			where: {
				escalatedId: id,
			},
		});

		if (ticket)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TICKET_ALREADY_EXISTS_TITLE"),
						description: language.get("TICKET_ALREADY_EXISTS_DESCRIPTION", {
							ticketId: ticket.id,
						}),
						color: this.client.config.colors.success,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

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
}
