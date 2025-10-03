import type { APIEmbedField, APIModalSubmitInteraction } from "@discordjs/core";
import { ComponentType, MessageFlags } from "@discordjs/core";
import type Language from "../../../../lib/classes/Language.js";
import Modal from "../../../../lib/classes/Modal.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";

export default class HelpDeskOptionModal extends Modal {
	/**
	 * Create our help desk option modal.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "helpDeskOptionsModal",
		});
	}

	public override async run({
		interaction,
	}: {
		interaction: APIModalSubmitInteraction;
		language: Language;
		shardId: number;
	}) {
		const [_, helpDeskOptionId] = interaction.data.custom_id.split(".");

		const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
			where: {
				id: helpDeskOptionId!,
			},
			include: {
				helpDeskOptionModalComponents: {
					orderBy: {
						position: "asc",
					},
				},
				response: true,
			},
		});

		if (!helpDeskOption) {
			this.client.logger.warn(`Help desk option with ID ${helpDeskOptionId} was not found.`);

			return;
		}

		await this.client.api.channels.createMessage(helpDeskOption.channelId!, {
			content: `<@${interaction.member!.user.id}> just filled out the ${
				helpDeskOption.modalTitle
			} form for help desk option ${helpDeskOption.name}.`,
			embeds: [
				{
					title: helpDeskOption.modalTitle!,
					fields: interaction.data.components
						.filter((component) => component.type === ComponentType.ActionRow)
						.flatMap((component) => component.components)
						.map((component) => {
							const helpDeskOptionModalComponent = helpDeskOption.helpDeskOptionModalComponents.find(
								(helpDeskOptionModalComponent) => helpDeskOptionModalComponent.id === component.custom_id,
							);

							if (!helpDeskOptionModalComponent) return null;

							return {
								name: helpDeskOptionModalComponent.label,
								value: component.value,
								inline: helpDeskOptionModalComponent.style === "SHORT",
							} as APIEmbedField;
						})
						.filter(Boolean) as APIEmbedField[],
					color: this.client.config.colors.success,
				},
			],
		});

		if (helpDeskOption.roleIds.length)
			await this.client.api.guilds.editMember(interaction.guild_id!, interaction.member!.user.id, {
				roles: [...new Set(interaction.member!.roles.concat(helpDeskOption.roleIds))],
			});

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			...JSON.parse(helpDeskOption.response.data),
			allowed_mentions: { parse: [], replied_user: true },
			flags: MessageFlags.Ephemeral,
		});
	}
}
