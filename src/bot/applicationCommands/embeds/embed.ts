import type { APIApplicationCommandInteraction, APIMessage } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	ChannelType,
	ComponentType,
	MessageFlags,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
} from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Embed extends ApplicationCommand {
	/**
	 * Create our embed command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "EMBED_COMMAND_NAME",
					description: "EMBED_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "EMBED_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_DATA_OPTION_NAME",
									description: "EMBED_COMMAND_CREATE_SUB_COMMAND_DATA_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EMBED_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "EMBED_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "EMBED_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME",
							description: "EMBED_COMMAND_LIST_SUB_COMMAND_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME",
							description: "EMBED_COMMAND_PREVIEW_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
									description: "EMBED_COMMAND_PREVIEW_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [
									ChannelType.GuildText,
									ChannelType.PublicThread,
									ChannelType.PrivateThread,
									ChannelType.GuildAnnouncement,
									ChannelType.AnnouncementThread,
								],
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EMBED_COMMAND_RENAME_SUB_COMMAND_NAME",
							description: "EMBED_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "EMBED_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
									description: "EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
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
			const data =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_DATA_OPTION_NAME")
				]!.value;

			try {
				JSON.parse(data);
			} catch (error) {
				if (error instanceof SyntaxError)
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_JSON_TITLE"),
								description: language.get("INVALID_JSON_DESCRIPTION"),
								color: this.client.config.colors.error,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
						flags: MessageFlags.Ephemeral,
					});

				throw error;
			}

			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			let embed = await this.client.prisma.embed.findFirst({
				where: {
					name: {
						equals: name,
						mode: "insensitive",
					},
					guildId: interaction.guild_id!,
				},
			});

			if (embed) embed = await this.client.prisma.embed.update({ where: { id: embed.id }, data: { name, data } });
			else embed = await this.client.prisma.embed.create({ data: { name, data, guildId: interaction.guild_id! } });

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EMBED_CREATED_TITLE"),
						description: language.get("EMBED_CREATED_DESCRIPTION", {
							embedId: embed.id,
							embedName: embed.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				components: [
					{
						components: [
							{
								custom_id: `previewEmbed.${embed.id}`,
								label: language.get("PREVIEW_EMBED_BUTTON_LABEL"),
								style: ButtonStyle.Primary,
								type: ComponentType.Button,
							},
						],
						type: ComponentType.ActionRow,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const embedId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: {
					id: embedId,
				},
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_NOT_FOUND_TITLE"),
							description: language.get("EMBED_NOT_FOUND_DESCRIPTION", {
								embedId,
							}),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});

			return Promise.all([
				this.client.prisma.embed.deleteMany({
					where: {
						guildId: interaction.guild_id!,
						id: embed.id,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_DELETED_TITLE"),
							description: language.get("EMBED_DELETED_DESCRIPTION", {
								embedId: embed.id,
								embedName: embed.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get(
				"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME",
			)
		) {
			const embeds = await this.client.prisma.embed.findMany({ where: { guildId: interaction.guild_id! } });

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EMBEDS_LIST_TITLE"),
						description: embeds.length
							? embeds.map((embed) => `**${embed.name}** \`[${embed.id}]\``).join(", ")
							: language.get("EMBEDS_LIST_NO_EMBEDS_DESCRIPTION"),
						color: this.client.config.colors.primary,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME")
		) {
			const embedId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: {
					id: embedId,
				},
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_NOT_FOUND_TITLE"),
							description: language.get("EMBED_NOT_FOUND_DESCRIPTION", {
								embedId,
							}),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});

			const channelId =
				interaction.arguments.channels?.[
					this.client.languageHandler.defaultLanguage!.get(
						"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
					)
				]?.id ?? interaction.channel.id;

			let message: APIMessage;

			try {
				message = await this.client.api.channels.createMessage(channelId, {
					...JSON.parse(embed.data.toString()),
					allowed_mentions: { parse: [], replied_user: true },
				});
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.code === RESTJSONErrorCodes.RequestBodyContainsInvalidJSON)
						return this.client.api.interactions.reply(interaction.id, interaction.token, {
							embeds: [
								{
									title: language.get("INVALID_JSON_TITLE"),
									description: language.get("INVALID_JSON_DESCRIPTION"),
									color: this.client.config.colors.error,
								},
							],
							allowed_mentions: { parse: [], replied_user: true },
							flags: MessageFlags.Ephemeral,
						});
					else if (error.code === RESTJSONErrorCodes.MissingPermissions)
						return this.client.api.interactions.reply(interaction.id, interaction.token, {
							embeds: [
								{
									title: language.get("MISSING_PERMISSIONS_PREVIEW_MESSAGE_TITLE"),
									description: language.get("MISSING_PERMISSIONS_PREVIEW_MESSAGE_DESCRIPTION", {
										channel: `<#${channelId}>`,
										name: embed.name.toLowerCase(),
									}),
								},
							],
							allowed_mentions: { parse: [], replied_user: true },
							flags: MessageFlags.Ephemeral,
						});
				}

				throw error;
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EMBED_PREVIEW_SENT_TITLE"),
						description: language.get("EMBED_PREVIEW_SENT_DESCRIPTION", {
							channel: `<#${channelId}>`,
						}),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: language.get("JUMP_TO_MESSAGE_BUTTON_LABEL"),
								style: ButtonStyle.Link,
								url: `https://discord.com/channels/${interaction.guild_id}/${message.channel_id}/${message.id}`,
							},
						],
					},
				],
			});
		} else if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_RENAME_SUB_COMMAND_NAME")
		) {
			const embedId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const embed = await this.client.prisma.embed.findUnique({
				where: {
					id: embedId,
				},
			});

			if (!embed)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_NOT_FOUND_TITLE"),
							description: language.get("EMBED_NOT_FOUND_DESCRIPTION", {
								embedId,
							}),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});

			const newName =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME")
				]!.value;

			return Promise.all([
				this.client.prisma.embed.update({ where: { id: embed.id }, data: { name: newName } }),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EMBED_RENAMED_TITLE"),
							description: language.get("EMBED_RENAMED_DESCRIPTION", {
								embedId: embed.id,
								newEmbedName: newName,
								oldEmbedName: embed.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);
		}
	}
}
