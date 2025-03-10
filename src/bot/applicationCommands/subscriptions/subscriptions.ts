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

export default class Ping extends ApplicationCommand {
	/**
	 * Create our ping command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "SUBSCRIPTIONS_COMMAND_NAME",
					description: "SUBSCRIPTIONS_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME",
							description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
									description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_ID_OPTION_NAME",
											description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_ID_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
											description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
										required: true,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_CATEGORY_OPTION_NAME",
											description:
												"SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_CATEGORY_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
									},
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
											description:
												"SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
										}),
										type: ApplicationCommandOptionType.String,
									},
								],
								type: ApplicationCommandOptionType.Subcommand,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME",
									description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_REMOVE_SUB_COMMAND_DESCRIPTION",
								}),
								options: [
									{
										...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
											name: "EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
											description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_REMOVE_SUB_COMMAND_ID_OPTION_DESCRIPTION",
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
									name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME",
									description: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_LIST_SUB_COMMAND_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
						type: ApplicationCommandOptionType.SubcommandGroup,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_NAME",
							description: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME",
									description: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_GROUP_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
									description: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread],
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_NAME",
									description: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.User,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SUBSCRIPTIONS_COMMAND_UNSUBSCRIBE_SUB_COMMAND_NAME",
							description: "SUBSCRIPTIONS_COMMAND_UNSUBSCRIBE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_NAME",
									description: "SUBSCRIPTIONS_COMMAND_UNSUBSCRIBE_SUB_COMMAND_USER_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.User,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME",
									description: "SUBSCRIPTIONS_COMMAND_UNSUBSCRIBE_SUB_COMMAND_GROUP_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								autocomplete: true,
								required: true,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
				type: ApplicationCommandType.ChatInput,
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
			this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME")
		) {
			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME",
				)
			) {
				const subscriptionGroups = await this.client.prisma.subscriptionGroup.findMany({
					include: { subscribedUsers: true },
				});

				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIPTION_GROUP_LIST_TITLE"),
							description: subscriptionGroups.length
								? subscriptionGroups
										.map(
											(subscriptionGroup) =>
												`${subscriptionGroup.category ? `${subscriptionGroup.category}\n\n` : ""}${
													subscriptionGroup.description
														? `${subscriptionGroup.description} \`[${subscriptionGroup.id}]\``
														: `**${subscriptionGroup.name}** \`[${subscriptionGroup.id}]\``
												}\n\n${subscriptionGroup.subscribedUsers
													.map((subscribedUser) => `<@${subscribedUser.userId}>`)
													.join(", ")}`,
										)
										.join("\n")
								: language.get("SUBSCRIPTION_GROUP_LIST_NO_SUBSCRIPTION_GROUPS_DESCRIPTION"),
							color: this.client.config.colors.primary,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
				});
			}

			// If the sub command is add, this value will be the name of the subscription group,
			// otherwise it will be the ID of the subscription group as we provide autocomplete for the option.
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			if (
				interaction.arguments.subCommand?.name ===
				this.client.languageHandler.defaultLanguage!.get(
					"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
				)
			) {
				const id =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_ID_OPTION_NAME",
						)
					]!.value;
				const category =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_ADD_SUB_COMMAND_CATEGORY_OPTION_NAME",
						)
					]?.value ?? null;
				const description =
					interaction.arguments.strings![
						this.client.languageHandler.defaultLanguage!.get(
							"HELP_DESK_OPTIONS_COMMAND_ADD_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
						)
					]?.value ?? null;

				return Promise.all([
					this.client.prisma.subscriptionGroup.upsert({
						where: { id },
						create: { id, name, category, description },
						update: { name, category, description },
					}),
					this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("SUBSCRIPTION_GROUP_ADDED_TITLE"),
								description: language.get("SUBSCRIPTION_GROUP_ADDED_DESCRIPTION", {
									subscriptionGroupId: id,
									subscriptionGroupName: name,
								}),
								color: this.client.config.colors.success,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
					}),
				]);
			}

			const subscriptionGroup = await this.client.prisma.subscriptionGroup.findUnique({
				where: { id: name },
			});

			if (!subscriptionGroup)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIPTION_GROUP_NOT_FOUND_TITLE"),
							description: language.get("SUBSCRIPTION_GROUP_NOT_FOUND_DESCRIPTION", { subscriptionGroupId: name }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			return Promise.all([
				this.client.prisma.subscriptionGroup.delete({
					where: { id: subscriptionGroup.id },
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIPTION_GROUP_REMOVED_TITLE"),
							description: language.get("SUBSCRIPTION_GROUP_REMOVED_DESCRIPTION", {
								subscriptionGroupId: subscriptionGroup.id,
								subscriptionGroupName: subscriptionGroup.name,
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
			this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_NAME")
		) {
			const subscriptionGroupId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME")
				]!.value;

			const subscriptionGroup = await this.client.prisma.subscriptionGroup.findUnique({
				where: { id: subscriptionGroupId },
			});

			if (!subscriptionGroup)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIPTION_GROUP_NOT_FOUND_TITLE"),
							description: language.get("SUBSCRIPTION_GROUP_NOT_FOUND_DESCRIPTION", { subscriptionGroupId }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const channelId =
				interaction.arguments.channels![
					this.client.languageHandler.defaultLanguage!.get(
						"CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
					)
				]!.id;
			const userId =
				interaction.arguments.users?.[
					this.client.languageHandler.defaultLanguage!.get(
						"SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_NAME",
					)
				]?.id ?? (interaction.member ?? interaction).user!.id;

			return Promise.all([
				this.client.prisma.subscribedUser.upsert({
					where: {
						userId_groupId: {
							groupId: subscriptionGroup.id,
							userId,
						},
						channelId,
					},
					create: {
						groupId: subscriptionGroup.id,
						userId,
						channelId,
					},
					update: {},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIBED_TITLE"),
							description: language.get("SUBSCRIBED_DESCRIPTION", {
								channelMention: `<#${channelId}>`,
								subscriptionGroup: subscriptionGroup.name,
								userMention: `<@${userId}>`,
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
			this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_UNSUBSCRIBE_SUB_COMMAND_NAME")
		) {
			const userId =
				interaction.arguments.users![
					this.client.languageHandler.defaultLanguage!.get(
						"SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_NAME",
					)
				]!.id;
			const userSubscriptionId =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_GROUP_SUB_COMMAND_NAME")
				]!.value;

			const userSubscription = await this.client.prisma.subscribedUser.findUnique({
				where: { id: userSubscriptionId },
				include: { group: true },
			});

			if (!userSubscription)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("SUBSCRIPTION_NOT_FOUND_TITLE"),
							description: language.get("SUBSCRIPTION_NOT_FOUND_DESCRIPTION", { userMention: `<@${userId}>` }),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			return Promise.all([
				this.client.prisma.subscribedUser.delete({
					where: { id: userSubscription.id },
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("UNSUBSCRIBED_TITLE"),
							description: language.get("UNSUBSCRIBED_DESCRIPTION", {
								channelMention: `<#${userSubscription.channelId}>`,
								subscriptionGroup: userSubscription.group.name,
								userMention: `<@${userId}>`,
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
