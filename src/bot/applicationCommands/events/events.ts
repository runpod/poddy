import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Events extends ApplicationCommand {
	/**
	 * Create our events command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "EVENTS_COMMAND_NAME",
					description: "EVENTS_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								required: true,
								type: ApplicationCommandOptionType.String,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME",
									description: "EVENTS_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
								}),
								required: true,
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread],
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
									description: "EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EVENTS_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "EVENTS_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_DELETE_SUB_COMMAND_EVENT_OPTION_NAME",
									description: "EVENTS_COMMAND_DELETE_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
								}),
								required: true,
								autocomplete: true,
								type: ApplicationCommandOptionType.String,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EVENTS_COMMAND_LIST_SUB_COMMAND_NAME",
							description: "EVENTS_COMMAND_LIST_SUB_COMMAND_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME",
							description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_EVENT_OPTION_NAME",
											description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
											description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION",
										}),
										required: true,
										type: ApplicationCommandOptionType.String,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_EVENT_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NEW_DESCRIPTION_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NEW_DESCRIPTION_OPTION_DESCRIPTION",
										}),
										required: true,
										type: ApplicationCommandOptionType.String,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_EVENT_OPTION_NAME",
											description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
										}),
										required: true,
										type: ApplicationCommandOptionType.Channel,
										channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread],
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_EVENT_OPTION_NAME",
											description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_NAME",
											description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_DESCRIPTION",
										}),
										required: true,
										choices: [
											{
												...client.languageHandler.generateLocalizationsForApplicationCommandOptionTypeStringWithChoices(
													{
														name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_CHOICES_ACTIVE",
													},
												),
												value: "active",
											},
											{
												...client.languageHandler.generateLocalizationsForApplicationCommandOptionTypeStringWithChoices(
													{
														name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_CHOICES_INACTIVE",
													},
												),
												value: "inactive",
											},
										],
										type: ApplicationCommandOptionType.String,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_EVENT_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.Channel,
										channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread],
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_NAME",
									description: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_EVENT_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_EVENT_OPTION_DESCRIPTION",
										}),
										required: true,
										autocomplete: true,
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_AMOUNT_OPTION_NAME",
											description:
												"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_AMOUNT_OPTION_DESCRIPTION",
										}),
										required: true,
										type: ApplicationCommandOptionType.Integer,
										min_value: 1,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
				],
				type: ApplicationCommandType.ChatInput,
				dm_permission: false,
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
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
			this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME")
		) {
			const id =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_EVENT_OPTION_NAME",
					)
				]!.value;

			const event = await this.client.prisma.event.findUnique({
				where: {
					id,
				},
			});

			if (!event)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EVENT_NOT_FOUND_TITLE"),
							description: language.get("EVENT_NOT_FOUND_DESCRIPTION", {
								eventId: id,
							}),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});

			if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NAME")
			) {
				const name =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NEW_NAME_OPTION_NAME",
						)
					]!.value;

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { name } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_NAME_TITLE"),
								description: language.get("EDITED_EVENT_NAME_DESCRIPTION", {
									eventId: event.id,
									oldEventName: event.name,
									newEventName: name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NAME",
				)
			) {
				const description =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NEW_DESCRIPTION_OPTION_NAME",
						)
					]!.value;

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { description } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_DESCRIPTION_TITLE"),
								description: language.get("EDITED_EVENT_DESCRIPTION_DESCRIPTION", {
									eventId: event.id,
									eventName: event.name,
									newDescription: description,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_NAME",
				)
			) {
				const channel =
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get(
							"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME",
						)
					]!;

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { channelId: channel.id } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_CHANNEL_TITLE"),
								description: language.get("EDITED_EVENT_CHANNEL_DESCRIPTION", {
									eventId: event.id,
									eventName: event.name,
									newChannel: `<#${channel.id}>`,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_NAME",
				)
			) {
				const status = interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get(
						"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_NAME",
					)
				]!.value as "active" | "inactive";

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { active: status === "active" } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_STATUS_TITLE"),
								description: language.get("EDITED_EVENT_STATUS_DESCRIPTION", {
									eventId: event.id,
									eventName: event.name,
									newStatus: status,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_NAME",
				)
			) {
				const channel =
					interaction.arguments.channels![
						this.client.languageHandler.defaultLanguage!.get(
							"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME",
						)
					];

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { codeLogChannelId: channel?.id ?? null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_CODES_LOG_CHANNEL_TITLE"),
								description: channel
									? language.get("EDITED_EVENT_CODES_LOG_CHANNEL_DESCRIPTION", {
											eventId: event.id,
											eventName: event.name,
											newChannel: `<#${channel.id}>`,
									  })
									: language.get("EDITED_EVENT_CODES_LOG_CHANNEL_RESET_DESCRIPTION", {
											eventId: event.id,
											eventName: event.name,
									  }),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			} else if (
				interaction.arguments.subCommand!.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_NAME",
				)
			) {
				const amount =
					interaction.arguments.integers![
						this.client.languageHandler.defaultLanguage!.get(
							"EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_AMOUNT_OPTION_NAME",
						)
					]?.value;

				return Promise.all([
					this.client.prisma.event.update({ where: { id: event.id }, data: { codeAmount: amount ?? null } }),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("EDITED_EVENT_CODE_AMOUNT_TITLE"),
								description: amount
									? language.get("EDITED_EVENT_CODE_AMOUNT_DESCRIPTION", {
											eventId: event.id,
											eventName: event.name,
											newAmount: `$${amount}`,
									  })
									: language.get("EDITED_EVENT_CODE_AMOUNT_RESET_DESCRIPTION", {
											eventId: event.id,
											eventName: event.name,
									  }),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			}
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;
			const channel =
				interaction.arguments.channels![
					this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME")
				]!;
			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME")
				]?.value;

			let event = await this.client.prisma.event.findFirst({
				where: { guildId: interaction.guild_id!, name: { mode: "insensitive", equals: name } },
			});

			if (event)
				event = await this.client.prisma.event.update({
					where: { id: event.id },
					data: { name, description: description ?? null },
				});
			else
				event = await this.client.prisma.event.create({
					data: { guildId: interaction.guild_id!, name, description: description ?? null, channelId: channel.id },
				});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EVENT_CREATED_TITLE"),
						description: language.get("EVENT_CREATED_DESCRIPTION", { eventId: event.id, eventName: event.name }),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const id =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_DELETE_SUB_COMMAND_EVENT_OPTION_NAME")
				]!.value;

			const event = await this.client.prisma.event.findUnique({
				where: {
					id,
				},
			});

			if (!event)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EVENT_NOT_FOUND_TITLE"),
							description: language.get("EVENT_NOT_FOUND_DESCRIPTION", {
								eventId: id,
							}),
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});

			return Promise.all([
				this.client.prisma.event.delete({ where: { id: event.id } }),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("EVENT_DELETED_TITLE"),
							description: language.get("EVENT_DELETED_DESCRIPTION", {
								eventId: event.id,
								eventName: event.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				}),
			]);
		} else if (
			interaction.arguments.subCommand!.name ===
			this.client.languageHandler.defaultLanguage!.get("EVENTS_COMMAND_LIST_SUB_COMMAND_NAME")
		) {
			const events = await this.client.prisma.event.findMany({
				where: { guildId: interaction.guild_id! },
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EVENTS_LIST_TITLE"),
						description: events.length
							? events
									.map(
										(event) =>
											`**${event.name}** \`[${event.id}]\`is currently ${event.active ? "active" : "inactive"} in <#${
												event.channelId
											}>.${event.description ? `\n>>> ${event.description}` : ""}`,
									)
									.join("\n")
							: language.get("EVENTS_LIST_NO_EVENTS_DESCRIPTION"),
						color: this.client.config.colors.primary,
					},
				],
			});
		}
	}
}
