import type { APIApplicationCommandInteraction, APIExtendedInvite } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	MessageFlags,
	RESTJSONErrorCodes,
} from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Invites extends ApplicationCommand {
	/**
	 * The regex to match invite codes.
	 */
	private readonly inviteCodeRegex =
		/(?:https:\/\/)?discord(?:app)?\.(?:gg|com)\/(?:invite\/)?(?<inviteCode>[^\s/?]{2,})(?!.*\/)/im;

	/**
	 * Create our invites command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "INVITES_COMMAND_NAME",
					description: "INVITES_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "INVITES_COMMAND_CREATE_SUB_COMMAND_NAME",
							description: "INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "INVITES_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME",
									description: "INVITES_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Channel,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
									description: "INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_CREATE_SUB_COMMAND_EXPIRATION_OPTION_NAME",
									description: "INVITES_COMMAND_CREATE_SUB_COMMAND_EXPIRATION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Integer,
								min_value: 0,
								max_value: 604_800,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_CREATE_SUB_COMMAND_MAX_USES_OPTION_NAME",
									description: "INVITES_COMMAND_CREATE_SUB_COMMAND_MAX_USES_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.Integer,
								min_value: 0,
								max_value: 100,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "INVITES_COMMAND_TRACK_SUB_COMMAND_NAME",
							description: "INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_TRACK_SUB_COMMAND_INVITE_OPTION_NAME",
									description: "INVITES_COMMAND_TRACK_SUB_COMMAND_INVITE_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_TRACK_SUB_COMMAND_NAME_OPTION_NAME",
									description: "INVITES_COMMAND_TRACK_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION_OPTION_NAME",
									description: "INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "INVITES_COMMAND_DELETE_SUB_COMMAND_NAME",
							description: "INVITES_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME",
									description: "INVITES_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true, // Implement this auto complete
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "INVITES_COMMAND_LIST_SUB_COMMAND_NAME",
							description: "INVITES_COMMAND_LIST_SUB_COMMAND_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "INVITES_COMMAND_INFO_SUB_COMMAND_NAME",
							description: "INVITES_COMMAND_INFO_SUB_COMMAND_DESCRIPTION",
						}),
						options: [
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_INFO_SUB_COMMAND_NAME_OPTION_NAME",
									description: "INVITES_COMMAND_INFO_SUB_COMMAND_NAME_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
								autocomplete: true, // Implement this auto complete
							},
							{
								...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
									name: "INVITES_COMMAND_INFO_SUB_COMMAND_INVITE_OPTION_NAME",
									description: "INVITES_COMMAND_INFO_SUB_COMMAND_INVITE_OPTION_DESCRIPTION",
								}),
								type: ApplicationCommandOptionType.String,
							},
						],
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
				dm_permission: false,

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
			this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;
			const channel =
				interaction.arguments.channels![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME")
				]!;

			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME")
				]?.value ?? null;

			const max_age =
				interaction.arguments.integers![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_EXPIRATION_OPTION_NAME")
				]?.value as number ?? 0;
			const max_uses =
				interaction.arguments.integers![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_CREATE_SUB_COMMAND_MAX_USES_OPTION_NAME")
				]?.value as number ?? 0;

			const invite = await this.client.api.channels.createInvite(channel.id, {
				max_age,
				max_uses,
				unique: true,
			});

			return Promise.all([
				this.client.prisma.invite.create({
					data: {
						name,
						description,
						code: invite.code,
						channelId: channel.id,
						createdBy: interaction.member!.user.id,
						guildId: interaction.guild_id!,
						maxAge: invite.max_age,
						maxUses: invite.max_uses,
						uses: invite.uses, // this is 0 right now but lol
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_CREATED_TITLE"),
							description: language.get("INVITE_CREATED_DESCRIPTION", {
								channelMention: `<#${channel.id}>`,
								inviteCode: invite.code,
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
			this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_TRACK_SUB_COMMAND_NAME")
		) {
			const invite =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_TRACK_SUB_COMMAND_INVITE_OPTION_NAME")
				]!.value;

			const { inviteCode } = this.inviteCodeRegex.exec(invite)?.groups ?? {};

			if (!inviteCode)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVALID_INVITE_TITLE"),
							description: language.get("INVALID_INVITE_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_TRACK_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const description =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION_OPTION_NAME")
				]?.value ?? null;

			let inviteData: APIExtendedInvite;

			try {
				inviteData = (await this.client.api.invites.get(inviteCode, {
					with_counts: true,
					with_expiration: true,
				})) as APIExtendedInvite;
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownInvite)
					return this.client.api.interactions.reply(interaction.id, interaction.token, {
						embeds: [
							{
								title: language.get("INVALID_INVITE_TITLE"),
								description: language.get("INVALID_INVITE_DESCRIPTION"),
								color: this.client.config.colors.error,
							},
						],
						allowed_mentions: { parse: [], replied_user: true },
						flags: MessageFlags.Ephemeral,
					});

				throw error;
			}

			if (inviteData.guild?.id !== interaction.guild_id!) {
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_NOT_FOR_THIS_SERVER"),
							description: language.get("INVITE_NOT_FOR_THIS_SERVER_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});
			}

			return Promise.all([
				this.client.prisma.invite.upsert({
					where: {
						code: inviteCode,
					},
					create: {
						code: inviteCode,
						channelId: interaction.channel.id,
						createdBy: interaction.member!.user.id,
						guildId: interaction.guild_id!,
						uses: inviteData.uses ?? 0,
						maxAge: inviteData.max_age,
						maxUses: inviteData.max_uses,
						name,
						description,
					},
					update: {
						name,
						description,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_TRACKED_TITLE"),
							description: language.get("INVITE_TRACKED_DESCRIPTION", {
								inviteCode,
								inviteName: name,
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
			this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_DELETE_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME")
				]!.value;

			const { inviteCode } = this.inviteCodeRegex.exec(name)?.groups ?? {};

			const invite = await this.client.prisma.invite.findFirst({
				where: {
					OR: [
						{
							code: inviteCode ?? name,
						},
						{
							name: {
								mode: "insensitive",
								equals: name,
							},
						},
					],
				},
			});

			if (!invite)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_NOT_FOUND_TITLE"),
							description: language.get("INVITE_NOT_FOUND_DESCRIPTION", {
								inviteName: name,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			return Promise.all([
				this.client.prisma.invite.delete({
					where: {
						code: invite.code,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_DELETED_TITLE"),
							description: language.get("INVITE_DELETED_DESCRIPTION", {
								inviteName: invite.name,
								inviteCode: invite.code,
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
			this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_LIST_SUB_COMMAND_NAME")
		) {
			const invites = await this.client.prisma.invite.findMany({
				where: { guildId: interaction.guild_id! },
			});

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("INVITES_LIST_TITLE"),
						description:
							invites.length === 0
								? language.get("INVITES_LIST_NO_INVITES_DESCRIPTION")
								: invites
										.map(
											(invite) => `[${invite.name}](https://discord.gg/${invite.code}) added by <@${invite.createdBy}>`,
										)
										.join("\n"),
						color: this.client.config.colors.primary,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (
			interaction.arguments.subCommand?.name ===
			this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_INFO_SUB_COMMAND_NAME")
		) {
			const name =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_INFO_SUB_COMMAND_NAME_OPTION_NAME")
				]?.value ?? "";
			const inviteValue =
				interaction.arguments.strings![
					this.client.languageHandler.defaultLanguage!.get("INVITES_COMMAND_INFO_SUB_COMMAND_INVITE_OPTION_NAME")
				]?.value ?? "";

			const { inviteCode } = this.inviteCodeRegex.exec(inviteValue)?.groups ?? {};

			const invite = await this.client.prisma.invite.findFirst({
				where: {
					OR: [
						{
							code: inviteCode ?? inviteValue ?? "",
						},
						{
							code: name,
						},
						{
							name: {
								mode: "insensitive",
								equals: name,
							},
						},
					],
				},
			});

			if (!invite)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVITE_NOT_FOUND_TITLE"),
							description: language.get("INVITE_NOT_FOUND_DESCRIPTION", {
								inviteName: name,
							}),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			let inviteData: APIExtendedInvite;

			try {
				const invites = await this.client.api.guilds.getInvites(interaction.guild_id!);

				const found = invites.find((inv) => inv.code === invite.code);

				if (!found)
					return await Promise.all([
						this.client.prisma.invite.delete({
							where: { code: invite.code },
						}),
						this.client.api.interactions.reply(interaction.id, interaction.token, {
							embeds: [
								{
									title: language.get("INVITE_EXPIRED_TITLE"),
									description: language.get("INVITE_EXPIRED_DESCRIPTION"),
									color: this.client.config.colors.error,
								},
							],
							allowed_mentions: {
								parse: [],
								replied_user: true,
							},
							flags: MessageFlags.Ephemeral,
						}),
					]);

				inviteData = found;
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownInvite)
					return Promise.all([
						this.client.prisma.invite.delete({
							where: { code: invite.code },
						}),
						this.client.api.interactions.reply(interaction.id, interaction.token, {
							embeds: [
								{
									title: language.get("INVITE_EXPIRED_TITLE"),
									description: language.get("INVITE_EXPIRED_DESCRIPTION"),
									color: this.client.config.colors.error,
								},
							],
							allowed_mentions: {
								parse: [],
								replied_user: true,
							},
							flags: MessageFlags.Ephemeral,
						}),
					]);

				throw error;
			}

			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("INVITES_INFO_TITLE"),
						description: `**Name:** ${invite.name}${
							invite.description ? `\n**Description:** ${invite.description}` : ""
						}\n**URL:** https://discord.gg/${invite.code}\n**Uses:** ${inviteData.uses}${
							inviteData.max_uses ? `/${inviteData.max_uses}` : ""
						}\n**Expires:** ${
							inviteData.expires_at ? `<t:${new Date(inviteData.expires_at).getTime() / 1_000}:F>` : "Never"
						}${inviteData.channel ? `\n**Channel:** <#${inviteData.channel.id}>` : ""}${
							inviteData.guild_scheduled_event
								? `\n**Guild Event:** [${inviteData.guild_scheduled_event.name}](https://discord.gg/${inviteData.code})`
								: ""
						}`,
						color: this.client.config.colors.primary,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
			});
		}
	}
}
