import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
} from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDesk extends ApplicationCommand {
	/**
	 * The regex to test if a string is a valid hex code.
	 */
	private readonly hexCodeRegex = /^(?:[\dA-Fa-f]{3}){1,2}$/m;

	/**
	 * Create our help desk command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "HELP_DESK_COMMAND_NAME",
					description: "HELP_DESK_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
									description: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_EMBED_COLOR_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_EMBED_COLOR_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_CHANNEL_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.Channel,
										channel_types: [
											ChannelType.GuildAnnouncement,
											ChannelType.AnnouncementThread,
											ChannelType.GuildText,
											ChannelType.PrivateThread,
											ChannelType.PublicThread,
										],
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
											description: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_ICON_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_ICON_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
				],
				dm_permission: false,
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
				type: ApplicationCommandType.ChatInput,
			},
		});
	}

	/**
	 * Run this application command.
	 *
	 * @param options - The options for this command.
	 * @param options.shardId - The shard ID that this interaction was received on.
	 * @param options.language - The language to use when replying to the interaction.
	 * @param options.interaction -  The interaction to run this command on.
	 */
	public override async run({
		interaction,
		language,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const embedColor = interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME")
				]!.value.replaceAll("#", "");

				if (!this.hexCodeRegex.test(embedColor))
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_EMBED_COLOR_TITLE"),
								description: language.get("INVALID_EMBED_COLOR_DESCRIPTION"),
								color: this.client.config.colors.error,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
						flags: MessageFlags.Ephemeral,
					});

				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { embedColor } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_EMBED_COLOR_SET_TITLE"),
								description: language.get("HELP_DESK_EMBED_COLOR_SET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									embedColor,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { embedColor: null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_EMBED_COLOR_RESET_TITLE"),
								description: language.get("HELP_DESK_EMBED_COLOR_RESET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const channel =
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_NAME")
					]!;

				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { channelId: channel.id } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_CHANNEL_SET_TITLE"),
								description: language.get("HELP_DESK_CHANNEL_SET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									channel: `<#${channel.id}>`,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else {
				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { channelId: null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_CHANNEL_RESET_TITLE"),
							},
						],
					}),
				]);
			}

			try {
				await this.client.api.channels.deleteMessage(helpDesk.channelId!, helpDesk.messageId!);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.code === RESTJSONErrorCodes.UnknownMessage) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}`,
						);
					} else if (error.code === RESTJSONErrorCodes.MissingAccess) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing access.`,
						);
					} else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions`,
						);
					} else throw error;
				} else throw error;
			}

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const description =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
						)
					]!.value;

				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { description } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_DESCRIPTION_SET_TITLE"),
								description: language.get("HELP_DESK_DESCRIPTION_SET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									description,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			} else {
				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { description: null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_DESCRIPTION_RESET_TITLE"),
								description: language.get("HELP_DESK_DESCRIPTION_RESET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			}

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const footer =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_COMMAND_FOOTER_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_OPTION_NAME",
						)
					]!.value;

				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { footer } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_FOOTER_SET_TITLE"),
								description: language.get("HELP_DESK_FOOTER_SET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									footer,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			} else {
				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { footer: null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_FOOTER_RESET_TITLE"),
								description: language.get("HELP_DESK_FOOTER_RESET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			}

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const footerIconUrl =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_COMMAND_FOOTER_ICON_SUB_COMMAND_GROUP_SET_SUB_COMMAND_FOOTER_ICON_OPTION_NAME",
						)
					]!.value;

				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { footerIconUrl } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_FOOTER_ICON_SET_TITLE"),
								description: language.get("HELP_DESK_FOOTER_ICON_SET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDesk.update({ where: { id: helpDesk.id }, data: { footerIconUrl: null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_FOOTER_ICON_RESET_TITLE"),
								description: language.get("HELP_DESK_FOOTER_ICON_RESET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;
			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
					)
				]?.value ?? null;

			const helpDesk = await this.client.prisma.helpDesk.create({
				data: { name, description, guildId: interaction.guild_id! },
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("HELP_DESK_CREATED_TITLE"),
						description: language.get("HELP_DESK_CREATED_DESCRIPTION", {
							helpDeskId: helpDesk.id,
							helpDeskName: helpDesk.name,
						}),
						color: this.client.config.colors.success,
					},
				],
			});
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskNameOrId,
						},
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId: helpDeskNameOrId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			await Promise.all([
				this.client.prisma.helpDesk.delete({ where: { id: helpDesk.id } }),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_DELETED_TITLE"),
							description: language.get("HELP_DESK_DELETED_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
							}),
							color: this.client.config.colors.success,
						},
					],
				}),
			]);

			try {
				await this.client.api.channels.deleteMessage(helpDesk.channelId!, helpDesk.messageId!);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.code === RESTJSONErrorCodes.UnknownMessage) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}`,
						);
					} else if (error.code === RESTJSONErrorCodes.MissingAccess) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing access.`,
						);
					} else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
						this.client.logger.error(
							`Unable to delete old help desk message ${helpDesk.messageId} in ${helpDesk.channelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions`,
						);
					} else throw error;
				} else throw error;
			}
		}
	}
}
