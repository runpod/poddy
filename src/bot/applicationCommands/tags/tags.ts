import { randomUUID } from "node:crypto";
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

export default class Tags extends ApplicationCommand {
	/**
	 * Create our tag command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "TAGS_COMMAND_NAME",
					description: "TAGS_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "TAGS_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "TAGS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "TAGS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "TAGS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "TAGS_COMMAND_CREATE_SUB_COMMAND_CONTENT_OPTION_NAME",
									description: "TAGS_COMMAND_CREATE_SUB_COMMAND_CONTENT_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "TAGS_COMMAND_EDIT_SUB_COMMAND_NAME",
							description: "TAGS_COMMAND_EDIT_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "TAGS_COMMAND_EDIT_SUB_COMMAND_NAME_OPTION_NAME",
									description: "TAGS_COMMAND_EDIT_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "TAGS_COMMAND_EDIT_SUB_COMMAND_CONTENT_OPTION_NAME",
									description: "TAGS_COMMAND_EDIT_SUB_COMMAND_CONTENT_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "TAGS_COMMAND_LIST_SUB_COMMAND_NAME",
							description: "TAGS_COMMAND_LIST_SUB_COMMAND_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "TAGS_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "TAGS_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "TAGS_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "TAGS_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
				dm_permission: false,
				default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),
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
			this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_CREATE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const content =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_CREATE_SUB_COMMAND_CONTENT_OPTION_NAME")
				]!.value;

			const existingTag = await this.client.prisma.tag.findFirst({
				where: {
					name: {
						equals: name,
						mode: "insensitive",
					},
				},
			});

			if (existingTag) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("TAG_ALREADY_EXISTS_TITLE"),
							description: language.get("TAG_ALREADY_EXISTS_DESCRIPTION", {
								tagName: existingTag.name,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});
			}

			const tag = await this.client.prisma.tag.create({
				data: {
					id: randomUUID(),
					name,
					content,
					authorId: interaction.member!.user.id,
					createdAt: new Date(),
				},
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TAG_CREATED_TITLE"),
						description: language.get("TAG_CREATED_DESCRIPTION", {
							tagName: tag.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_LIST_SUB_COMMAND_NAME")
		) {
			const tags = await this.client.prisma.tag.findMany({
				orderBy: {
					name: "asc",
				},
			});

			if (tags.length === 0) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("TAG_LIST_TITLE"),
							description: language.get("TAG_LIST_EMPTY_DESCRIPTION"),
							color: this.client.config.colors.primary,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				});
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TAG_LIST_TITLE"),
						description: tags.map((tag) => `**${tag.name}** \`[${tag.id}]\``).join("\n"),
						color: this.client.config.colors.primary,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const tag = await this.client.prisma.tag.findFirst({
				where: {
					OR: [
						{ id: name },
						{
							name: {
								equals: name,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!tag) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("TAG_NOT_FOUND_TITLE"),
							description: language.get("TAG_NOT_FOUND_DESCRIPTION", {
								tagName: name,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});
			}

			await this.client.prisma.tag.delete({
				where: {
					id: tag.id,
				},
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TAG_DELETED_TITLE"),
						description: language.get("TAG_DELETED_DESCRIPTION", {
							tagName: tag.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_EDIT_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_EDIT_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const content =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("TAGS_COMMAND_EDIT_SUB_COMMAND_CONTENT_OPTION_NAME")
				]!.value;

			const tag = await this.client.prisma.tag.findFirst({
				where: {
					OR: [
						{ id: name },
						{
							name: {
								equals: name,
								mode: "insensitive",
							},
						},
					],
				},
			});

			if (!tag) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("TAG_NOT_FOUND_TITLE"),
							description: language.get("TAG_NOT_FOUND_DESCRIPTION", {
								tagName: name,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});
			}

			const updatedTag = await this.client.prisma.tag.update({
				where: {
					id: tag.id,
				},
				data: {
					content,
				},
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TAG_UPDATED_TITLE"),
						description: language.get("TAG_UPDATED_DESCRIPTION", {
							tagName: updatedTag.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}
	}
}
