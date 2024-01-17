import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	MessageFlags,
	PermissionFlagsBits,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDesk extends ApplicationCommand {
	/**
	 * The regex to test if a string is a valid custom emoji.
	 */
	private readonly customEmojiRegex = /<(?<animated>a)?:(?<emojiName>\w+):(?<emojiId>\d+)>/m;

	/**
	 * Create our help desk command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "HELP_DESK_OPTIONS_COMMAND_NAME",
					description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								max_length: 100,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								max_length: 100,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Integer,
								min_value: 1,
								max_value: 25,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_RESPONSE_OPTION_DESCRIPTION",
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
							name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										max_length: 100,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
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
							name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_EMBED_COLOR_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_EMOJI_OPTION_DESCRIPTION",
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
									description: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_COMMAND_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
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
							name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_POSITION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Integer,
								required: true,
								min_value: 1,
								max_value: 25,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
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
							description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								max_length: 100,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
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
			this.client.languageHandler.defaultLanguage!.get(
				"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
			)
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			let helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					name: {
						equals: name,
						mode: "insensitive",
					},
					helpDeskId,
				},
			});

			const helpDeskOptionsCount = await this.client.prisma.helpDeskOption.count({
				where: { helpDeskId },
			});

			if (!helpDeskOption && helpDeskOptionsCount >= 25)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("MAXIMUM_HELP_DESK_OPTIONS_REACHED_TITLE"),
							description: language.get("MAXIMUM_HELP_DESK_OPTIONS_REACHED_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const embedId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
					)
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: {
					id: embedId,
					guildId: interaction.guild_id!,
				},
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_RESPONSE_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_RESPONSE_NOT_FOUND_DESCRIPTION", {
								helpDeskResponseId: embedId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
					)
				]?.value;
			const emoji =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME",
					)
				]?.value;
			const position =
				interaction.arguments.integers![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
					)
				]?.value ??
				helpDeskOption?.position ??
				helpDeskOptionsCount + 1;

			const { animated, emojiName, emojiId } = this.customEmojiRegex.exec(emoji ?? "")?.groups ?? {};

			if (helpDeskOption) {
				if (helpDeskOption.position !== position)
					await this.client.prisma.helpDeskOption.updateMany({
						where: {
							helpDeskId,
							position: {
								gte: position,
							},
						},
						data: {
							position: {
								increment: 1,
							},
						},
					});

				helpDeskOption = await this.client.prisma.helpDeskOption.update({
					where: {
						id: helpDeskOption.id,
						helpDeskId,
					},
					data: {
						name,
						position,
						description: description ?? null,
						emojiAnimated: Boolean(animated),
						emojiName: emojiId ? emoji ?? null : emojiName ?? null,
						emojiId: emojiId ?? null,
						responseId: embedId,
					},
				});
			} else {
				helpDeskOption = await this.client.prisma.helpDeskOption.create({
					data: {
						name,
						position,
						helpDeskId,
						description: description ?? null,
						emojiAnimated: Boolean(animated),
						emojiName: emojiId ? emoji ?? null : emojiName ?? null,
						emojiId: emojiId ?? null,
						responseId: embedId,
					},
				});
			}

			return Promise.all([
				this.client.functions.updateHelpDesk(helpDeskId),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_ADDED_TITLE"),
							description: language.get("HELP_DESK_OPTION_ADDED_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								optionName: helpDeskOption.name,
							}),
							color: this.client.config.colors.success,
						},
					],
				}),
			]);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const embedId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
					)
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: {
					id: embedId,
					guildId: interaction.guild_id!,
				},
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_RESPONSE_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_RESPONSE_NOT_FOUND_DESCRIPTION", {
								helpDeskResponseId: embedId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			return Promise.all([
				this.client.prisma.helpDeskOption.update({
					where: {
						helpDeskId,
						id: helpDeskOptionId,
					},
					data: {
						responseId: embedId,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_RESPONSE_SET_TITLE"),
							description: language.get("HELP_DESK_OPTION_RESPONSE_SET_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
								optionName: helpDeskOption.name,
								response: embedId,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get(
				"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
			)
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
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
				const description =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
						)
					]!.value;

				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							helpDeskId,
							id: helpDeskOptionId,
						},
						data: {
							description,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_DESCRIPTION_SET_TITLE"),
								description: language.get("HELP_DESK_OPTION_DESCRIPTION_SET_DESCRIPTION", {
									helpDeskId,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOptionId,
									optionName: helpDeskOption.name,
									description,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							helpDeskId,
							id: helpDeskOptionId,
						},
						data: {
							description: null,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_DESCRIPTION_RESET_TITLE"),
								description: language.get("HELP_DESK_OPTION_DESCRIPTION_RESET_DESCRIPTION", {
									helpDeskId,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOptionId,
									optionName: helpDeskOption.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDeskId);
		} else if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
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
				const emoji =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_EMOJI_OPTION_NAME",
						)
					]!.value;

				const { animated, emojiName, emojiId } = this.customEmojiRegex.exec(emoji ?? "")?.groups ?? {};

				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							helpDeskId,
							id: helpDeskOptionId,
						},
						data: {
							emojiAnimated: Boolean(animated),
							emojiName: (emojiId ? emojiName : emoji) ?? null,
							emojiId: emojiId ?? null,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_EMOJI_SET_TITLE"),
								description: language.get("HELP_DESK_OPTION_EMOJI_SET_DESCRIPTION", {
									helpDeskId,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOptionId,
									optionName: helpDeskOption.name,
									emoji,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else
				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							helpDeskId,
							id: helpDeskOptionId,
						},
						data: {
							emojiAnimated: false,
							emojiName: null,
							emojiId: null,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_EMOJI_RESET_TITLE"),
								description: language.get("HELP_DESK_OPTION_EMOJI_RESET_DESCRIPTION", {
									helpDeskId,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOptionId,
									optionName: helpDeskOption.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDeskId);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const position =
				interaction.arguments.integers![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
					)
				]!.value;

			if (helpDeskOption.position === position)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_POSITION_NOT_CHANGED_TITLE"),
							description: language.get("HELP_DESK_OPTION_POSITION_NOT_CHANGED_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
								optionName: helpDeskOption.name,
								position,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				});

			await this.client.prisma.helpDeskOption.updateMany({
				where: {
					helpDeskId,
					position: {
						gte: position,
					},
				},
				data: {
					position: {
						increment: 1,
					},
				},
			});

			await Promise.all([
				this.client.prisma.helpDeskOption.update({
					where: {
						helpDeskId,
						id: helpDeskOptionId,
					},
					data: {
						position,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_POSITION_SET_TITLE"),
							description: language.get("HELP_DESK_OPTION_POSITION_SET_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
								optionName: helpDeskOption.name,
								position,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDeskId);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get(
				"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME",
			)
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			await Promise.all([
				this.client.prisma.helpDeskOption.delete({
					where: {
						helpDeskId,
						id: helpDeskOptionId,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_REMOVED_TITLE"),
							description: language.get("HELP_DESK_OPTION_REMOVED_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
								optionName: helpDeskOption.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDeskId);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_RENAME_SUB_COMMAND_NAME")
		) {
			const helpDeskId =
				interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]!
					.value;

			const helpDesk = await this.client.prisma.helpDesk.findUnique({
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
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
				where: {
					id: helpDeskOptionId,
					helpDeskId,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionId,
							}),
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
				this.client.prisma.helpDeskOption.update({
					where: {
						helpDeskId,
						id: helpDeskOptionId,
					},
					data: {
						name: newName,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_RENAMED_TITLE"),
							description: language.get("HELP_DESK_OPTION_RENAMED_DESCRIPTION", {
								helpDeskId,
								helpDeskName: helpDesk.name,
								newOptionName: newName,
								oldOptionName: helpDeskOption.name,
								optionId: helpDeskOptionId,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDeskId);
		}
	}
}
