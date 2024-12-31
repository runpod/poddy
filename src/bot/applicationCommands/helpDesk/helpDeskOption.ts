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
	 * The regex to test if a string is a valid unicode emoji.
	 */
	private readonly unicodeEmojiRegex = /\p{Extended_Pictographic}/u;

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
							name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_HELP_DESK_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_NAME_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_HELP_DESK_OPTION_NAME",
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
									name: "HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_RESPONSE_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
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
									name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_NAME",
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
											name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_EMOJI_OPTION_NAME",
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
									name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_HELP_DESK_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_OPTION_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_POSITION_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_HELP_DESK_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_OPTION_OPTION_NAME",
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
							name: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_HELP_DESK_OPTION_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_OPTION_OPTION_NAME",
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
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_NAME",
							description: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_ROLE_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_ROLE_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.Role,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_ROLE_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_ROLE_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.Role,
										required: true,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME",
									description: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_HELP_DESK_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_OPTION_OPTION_NAME",
											description:
												"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
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
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
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
					"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const description =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
						)
					]!.value;

				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							id: helpDeskOption.id,
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
									description,
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
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
							id: helpDeskOption.id,
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
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}

		if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
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
					"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
				)
			) {
				const emoji =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_EMOJI_SUB_COMMAND_GROUP_SET_SUB_COMMAND_EMOJI_OPTION_NAME",
						)
					]?.value;

				const { animated, emojiName, emojiId } = this.customEmojiRegex.exec(emoji ?? "")?.groups ?? {
					animated: undefined,
					emojiName: this.unicodeEmojiRegex.exec(emoji ?? "")?.[0],
					emojiId: undefined,
				};

				await Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							id: helpDeskOption.id,
						},
						data: {
							emojiAnimated: Boolean(animated),
							emojiName: emojiId ? (emoji ?? null) : (emojiName ?? null),
							emojiId: emojiId ?? null,
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_EMOJI_SET_TITLE"),
								description: language.get("HELP_DESK_OPTION_EMOJI_SET_DESCRIPTION", {
									emoji,
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
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
							id: helpDeskOption.id,
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
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}

		if (
			interaction.arguments.subCommandGroup?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
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
					"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
				)
			) {
				const role =
					interaction.arguments.roles![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_ROLE_OPTION_NAME",
						)
					]!;

				return Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							id: helpDeskOption.id,
						},
						data: {
							roleIds: {
								set: [...new Set([...helpDeskOption.roleIds, role.id])],
							},
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_ROLE_ADDED_TITLE"),
								description: language.get("HELP_DESK_OPTION_ROLE_ADDED_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
									role: `<@&${role.id}>`,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			}

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME",
				)
			) {
				const role =
					interaction.arguments.roles![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_ROLES_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_ROLE_OPTION_NAME",
						)
					]!;

				return Promise.all([
					this.client.prisma.helpDeskOption.update({
						where: {
							id: helpDeskOption.id,
						},
						data: {
							roleIds: {
								set: helpDeskOption.roleIds.filter((roleId) => roleId !== role.id),
							},
						},
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("HELP_DESK_OPTION_ROLE_REMOVED_TITLE"),
								description: language.get("HELP_DESK_OPTION_ROLE_REMOVED_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
									role: `<@&${role.id}>`,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("HELP_DESK_OPTION_ROLE_LIST_TITLE"),
						description: helpDeskOption.roleIds.length
							? helpDeskOption.roleIds.map((roleId) => `<@&${roleId}>`).join(", ")
							: language.get("HELP_DESK_OPTION_ROLE_LIST_NO_ROLES_DESCRIPTION", {
									helpDeskId: helpDesk.id,
									helpDeskName: helpDesk.name,
									optionId: helpDeskOption.id,
									optionName: helpDeskOption.name,
								}),
						color: this.client.config.colors.primary,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage?.get("HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const responseId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
					)
				]!.value;

			const response = await this.client.prisma.embed.findUnique({
				where: {
					id: responseId,
					guildId: interaction.guild_id!,
				},
			});

			if (!response)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_RESPONSE_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_RESPONSE_NOT_FOUND_DESCRIPTION", {
								helpDeskResponseId: responseId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionsCount = await this.client.prisma.helpDeskOption.count({
				where: {
					helpDeskId: helpDesk.id,
				},
			});

			if (helpDeskOptionsCount >= 25)
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

			const optionName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;
			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
					)
				]?.value ?? null;
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
				]?.value ?? helpDeskOptionsCount + 1;

			const { animated, emojiName, emojiId } = this.customEmojiRegex.exec(emoji ?? "")?.groups ?? {
				animated: undefined,
				emojiName: this.unicodeEmojiRegex.exec(emoji ?? "")?.[0],
				emojiId: undefined,
			};

			const helpDeskOption = await this.client.prisma.helpDeskOption.create({
				data: {
					name: optionName,
					description,
					emojiAnimated: Boolean(animated),
					emojiName: emojiId ? (emoji ?? null) : (emojiName ?? null),
					emojiId: emojiId ?? null,
					position,
					helpDeskId: helpDesk.id,
					responseId: response.id,
				},
			});

			return Promise.all([
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_ADDED_TITLE"),
							description: language.get("HELP_DESK_OPTION_ADDED_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								optionName: helpDeskOption.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
				this.client.functions.updateHelpDesk(helpDesk.id),
			]);
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_RESPONSE_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const responseId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_RESPONSE_OPTION_NAME",
					)
				]!.value;

			const response = await this.client.prisma.embed.findUnique({
				where: {
					id: responseId,
					guildId: interaction.guild_id!,
				},
			});

			if (!response)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_RESPONSE_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_RESPONSE_NOT_FOUND_DESCRIPTION", {
								helpDeskResponseId: responseId,
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
						id: helpDeskOption.id,
					},
					data: {
						responseId: response.id,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_RESPONSE_SET_TITLE"),
							description: language.get("HELP_DESK_OPTION_RESPONSE_SET_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								optionName: helpDeskOption.name,
								response: response.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
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
						"HELP_DESK_OPTIONS_COMMAND_POSITION_SUB_COMMAND_POSITION_OPTION_NAME",
					)
				]!.value;

			if (position === helpDeskOption.position)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_POSITION_NOT_CHANGED_TITLE"),
							description: language.get("HELP_DESK_OPTION_POSITION_NOT_CHANGED_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								optionName: helpDeskOption.name,
								position,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			if (position > helpDeskOption.position)
				await this.client.prisma.helpDeskOption.updateMany({
					where: {
						helpDeskId: helpDesk.id,
						position: {
							[position > helpDeskOption.position ? "gte" : "lt"]: position,
						},
					},
					data: {
						position: {
							[position > helpDeskOption.position ? "increment" : "decrement"]: 1,
						},
					},
				});

			await Promise.all([
				this.client.prisma.helpDeskOption.update({
					where: {
						id: helpDeskOption.id,
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
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								optionName: helpDeskOption.name,
								position,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_REMOVE_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
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
						id: helpDeskOption.id,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_REMOVED_TITLE"),
							description: language.get("HELP_DESK_OPTION_REMOVED_DESCRIPTION"),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_NAME")
		) {
			const helpDeskNameOrId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
					)
				]!.value;

			const helpDesk = await this.client.prisma.helpDesk.findFirst({
				where: {
					OR: [
						{
							name: {
								equals: helpDeskNameOrId,
								mode: "insensitive",
							},
						},
						{
							id: helpDeskNameOrId,
						},
					],
					guildId: interaction.guild_id!,
				},
			});

			if (!helpDesk)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDeskNameOrId,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const helpDeskOptionIdOrName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_DESCRIPTION_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
					)
				]!.value;

			const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
				where: {
					OR: [
						{
							id: helpDeskOptionIdOrName,
						},
						{
							name: {
								equals: helpDeskOptionIdOrName,
								mode: "insensitive",
							},
						},
					],
					helpDeskId: helpDesk.id,
				},
			});

			if (!helpDeskOption)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
							description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOptionIdOrName,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const newName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"HELP_DESK_OPTIONS_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
					)
				]!.value;

			await Promise.all([
				this.client.prisma.helpDeskOption.update({
					where: {
						id: helpDeskOption.id,
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
								helpDeskId: helpDesk.id,
								helpDeskName: helpDesk.name,
								optionId: helpDeskOption.id,
								oldOptionName: helpDeskOption.name,
								newOptionName: newName,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);

			return this.client.functions.updateHelpDesk(helpDesk.id);
		}
	}
}
