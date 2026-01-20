import type { APIChatInputApplicationCommandGuildInteraction } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";
import type { PoddyClient } from "../../../client.js";

export default class QAChannels extends ApplicationCommand {
	/**
	 * Create the qa-channels command to manage allowed QA channels.
	 */
	public constructor(client: PoddyClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "QA_CHANNELS_COMMAND_NAME",
					description: "QA_CHANNELS_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "QA_CHANNELS_ADD_OPTION_NAME",
							description: "QA_CHANNELS_ADD_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "QA_CHANNELS_CHANNEL_OPTION_NAME",
									description: "QA_CHANNELS_CHANNEL_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText],
								required: true,
							},
						],
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "QA_CHANNELS_REMOVE_OPTION_NAME",
							description: "QA_CHANNELS_REMOVE_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "QA_CHANNELS_CHANNEL_OPTION_NAME",
									description: "QA_CHANNELS_CHANNEL_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText],
								required: true,
							},
						],
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "QA_CHANNELS_LIST_OPTION_NAME",
							description: "QA_CHANNELS_LIST_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
				default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),
				type: ApplicationCommandType.ChatInput,
				contexts: [InteractionContextType.Guild],
			},
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>;
		language: Language;
		shardId: number;
	}) {
		const subcommand = interaction.arguments.subCommand;

		if (!subcommand) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_NO_SUBCOMMAND"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const defaultLang = this.client.languageHandler.defaultLanguage!;
		const subcommandHandlers: Record<string, () => Promise<unknown>> = {
			[defaultLang.get("QA_CHANNELS_ADD_OPTION_NAME")]: () => this.handleAdd(interaction, language),
			[defaultLang.get("QA_CHANNELS_REMOVE_OPTION_NAME")]: () => this.handleRemove(interaction, language),
			[defaultLang.get("QA_CHANNELS_LIST_OPTION_NAME")]: () => this.handleList(interaction, language),
		};

		const handler = subcommandHandlers[subcommand.name];
		if (handler) {
			return handler();
		}
	}

	private getChannelIdFromInteraction(
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>,
	): string | undefined {
		const channelOptionName = this.client.languageHandler.defaultLanguage!.get("QA_CHANNELS_CHANNEL_OPTION_NAME");
		return interaction.arguments.channels?.[channelOptionName]?.id;
	}

	private async handleAdd(
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>,
		language: Language,
	) {
		const channelId = this.getChannelIdFromInteraction(interaction);

		if (!channelId) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_NO_CHANNEL_PROVIDED"),
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			await this.client.prisma.qAAllowedChannel.create({
				data: {
					channelId,
					guildId: interaction.guild_id,
				},
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: `Added <#${channelId}> to QA allowed channels.`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error: any) {
			if (error.code === "P2002") {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					content: `<#${channelId}> is already in the QA allowed channels list.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			console.error("Error adding QA channel:", error);
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_ADD_ERROR"),
				flags: MessageFlags.Ephemeral,
			});
		}
	}

	private async handleRemove(
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>,
		language: Language,
	) {
		const channelId = this.getChannelIdFromInteraction(interaction);

		if (!channelId) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_NO_CHANNEL_PROVIDED"),
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			await this.client.prisma.qAAllowedChannel.delete({
				where: { channelId },
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: `Removed <#${channelId}> from QA allowed channels.`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error: any) {
			if (error.code === "P2025") {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					content: `<#${channelId}> was not in the QA allowed channels list.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			console.error("Error removing QA channel:", error);
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_REMOVE_ERROR"),
				flags: MessageFlags.Ephemeral,
			});
		}
	}

	private async handleList(
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>,
		language: Language,
	) {
		try {
			const channels = await this.client.prisma.qAAllowedChannel.findMany({
				where: {
					guildId: interaction.guild_id,
				},
				orderBy: {
					addedAt: "asc",
				},
			});

			if (channels.length === 0) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					content: "No QA allowed channels configured. The bot will respond to mentions in all channels.",
					flags: MessageFlags.Ephemeral,
				});
			}

			const channelList = channels.map((ch, index) => `${index + 1}. <#${ch.channelId}>`).join("\n");

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: `**QA Allowed Channels (${channels.length}):**\n\n${channelList}`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error("Error listing QA channels:", error);
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("QA_CHANNELS_LIST_ERROR"),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
