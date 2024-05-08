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
							name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
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
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME",
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
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
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
							name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
							description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
											description:
												"HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
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
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_COMMAND_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
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
							name: "EMBED_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
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
							name: "EMBED_COMMAND_RENAME_SUB_COMMAND_NAME",
							description: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
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
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;
			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
					)
				]?.value ?? null;

			let helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					name: {
						equals: name,
						mode: "insensitive",
					},
					guildId: interaction.guild_id!,
				},
			});

			if (helpDesk)
				helpDesk = await this.client.prisma.helpDesk.update({
					where: { id: helpDesk.id },
					data: { name, description },
				});
			else
				helpDesk = await this.client.prisma.helpDesk.create({
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
				allowed_mentions: { parse: [], replied_user: true },
			});
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					id: helpDeskId,
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId }),
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
				const hexCode = interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_NAME")
				]!.value.replaceAll("#", "");

				if (!this.hexCodeRegex.test(hexCode))
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
					this.client.prisma.helpDesk.update({
						where: { id: helpDesk.id, guildId: interaction.guild_id! },
						data: { embedColor: hexCode },
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_EMBED_COLOR_SET_TITLE"),
								description: language.get("HELP_DESK_EMBED_COLOR_SET_DESCRIPTION", {
									embedColor: hexCode,
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDesk.update({
						where: { id: helpDeskId, guildId: interaction.guild_id! },
						data: { embedColor: null },
					}),
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
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get(
				"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
			)
		) {
			const helpDeskId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					id: helpDeskId,
					guildId: interaction.guild_id!,
				},
			});

			const oldChannelId = helpDesk?.channelId;

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId }),
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
				const channelId =
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get(
							"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
						)
					]!.id;

				await Promise.all([
					this.client.prisma.helpDesk.update({
						where: { id: helpDesk.id, guildId: interaction.guild_id! },
						data: { channelId },
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_CHANNEL_SET_TITLE"),
								description: language.get("HELP_DESK_CHANNEL_SET_DESCRIPTION", {
									channel: `<#${channelId}>`,
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else {
				await Promise.all([
					this.client.prisma.helpDesk.update({
						where: { id: helpDeskId, guildId: interaction.guild_id! },
						data: { channelId: null },
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_CHANNEL_RESET_TITLE"),
								description: language.get("HELP_DESK_CHANNEL_RESET_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			}

			if (oldChannelId && helpDesk.messageId) {
				try {
					await this.client.api.channels.deleteMessage(oldChannelId, helpDesk.messageId);
				} catch (error) {
					if (error instanceof DiscordAPIError) {
						if (error.code === RESTJSONErrorCodes.UnknownMessage) {
							this.client.logger.error(
								`Unable to delete old help desk message ${helpDesk.messageId} in ${oldChannelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}`,
							);
						} else if (error.code === RESTJSONErrorCodes.MissingAccess) {
							this.client.logger.error(
								`Unable to delete old help desk message ${helpDesk.messageId} in ${oldChannelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing access.`,
							);
						} else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
							this.client.logger.error(
								`Unable to delete old help desk message ${helpDesk.messageId} in ${oldChannelId} for help desk ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions`,
							);
						}
					} else throw error;
				}
			}

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					id: helpDeskId,
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			await Promise.all([
				this.client.prisma.helpDesk.delete({ where: { id: helpDeskId } }),
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
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			if (!helpDesk.channelId || !helpDesk.messageId) return;

			await this.client.api.channels.deleteMessage(helpDesk.channelId, helpDesk.messageId);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_RENAME_SUB_COMMAND_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					id: helpDeskId,
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const newName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME")
				]!.value;

			await Promise.all([
				this.client.prisma.helpDesk.update({
					where: { id: helpDesk.id },
					data: { name: newName },
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_RENAMED_TITLE"),
							description: language.get("HELP_DESK_RENAMED_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								newHelpDeskName: newName,
								oldHelpDeskName: helpDesk.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							id: helpDeskId,
						},
						{
							name: {
								equals: helpDeskId,
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", { helpDeskId }),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
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
						allowed_mentions: { parse: [] },
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDesk.update({
						where: { id: helpDesk.id },
						data: { description: null },
					}),
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
						allowed_mentions: { parse: [] },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}
	}
}
