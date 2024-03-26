import { Buffer } from "node:buffer";
import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class Submit extends ApplicationCommand {
	/**
	 * Create our submit command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "SUBMIT_COMMAND_NAME",
					description: "SUBMIT_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SUBMIT_COMMAND_EVENT_OPTION_NAME",
							description: "SUBMIT_COMMAND_EVENT_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.String,
						autocomplete: true,
						required: true,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SUBMIT_COMMAND_IMAGE_OPTION_NAME",
							description: "SUBMIT_COMMAND_IMAGE_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.Attachment,
						required: true,
					},
				],
				type: ApplicationCommandType.ChatInput,
				dm_permission: false,
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
		const eventId =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("SUBMIT_COMMAND_EVENT_OPTION_NAME")
			]!.value;

		const event = await this.client.prisma.event.findUnique({
			where: {
				id: eventId,
			},
		});

		if (!event)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EVENT_NOT_FOUND_TITLE"),
						description: language.get("EVENT_NOT_FOUND_DESCRIPTION", {
							eventId,
						}),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		const submission = await this.client.prisma.submission.findUnique({
			where: {
				userId_eventId: {
					userId: (interaction.member?.user ?? interaction.user!).id,
					eventId: event.id,
				},
			},
		});

		if (submission)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("ALREADY_SUBMITTED_TITLE"),
						description: language.get("ALREADY_SUBMITTED_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		const response = await fetch(
			interaction.arguments.attachments![
				this.client.languageHandler.defaultLanguage!.get("SUBMIT_COMMAND_IMAGE_OPTION_NAME")
			]!.url,
		);

		if (!response.ok)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("FAILED_FETCHING_IMAGE_TITLE"),
						description: language.get("FAILED_FETCHING_IMAGE_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
			});

		const buffer = Buffer.from(await response.arrayBuffer());
		const extension = response.url.split("?").shift()?.split(".").pop();

		const user = interaction.member?.user ?? interaction.user!;

		const message = await this.client.api.channels.createMessage(event.channelId, {
			embeds: [
				{
					author: {
						name: user.global_name ?? user.username,
						icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
							user.avatar?.startsWith("a_") ? "gif" : "png"
						}?size=2048`,
					},
					image: {
						url: `attachment://submission_${(interaction.member?.user ?? interaction.user!).id}.${extension}`,
					},
					color: this.client.config.colors.primary,
				},
			],
			components: [
				{
					components: [
						{
							custom_id: `upvote`,
							label: "Upvote",
							type: ComponentType.Button,
							style: ButtonStyle.Success,
							emoji: {
								name: "⬆️",
							},
						},
					],
					type: ComponentType.ActionRow,
				},
			],
			files: [
				{
					data: buffer,
					name: `submission_${(interaction.member?.user ?? interaction.user!).id}.${extension}`,
				},
			],
		});

		return Promise.all([
			this.client.prisma.submission.create({
				data: {
					eventId: event.id,
					messageId: message.id,
					userId: (interaction.member?.user ?? interaction.user!).id,
				},
			}),
			this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("SUBMITTED_TITLE"),
						description: language.get("SUBMITTED_DESCRIPTION", {
							eventId: event.id,
							eventName: event.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				components: [
					{
						components: [
							{
								url: `https://discord.com/channels/${interaction.guild_id}/${message.channel_id}/${message.id}`,
								label: language.get("JUMP_TO_SUBMISSION_BUTTON_LABEL"),
								style: ButtonStyle.Link,
								type: ComponentType.Button,
							},
						],
						type: ComponentType.ActionRow,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			}),
		]);
	}
}
