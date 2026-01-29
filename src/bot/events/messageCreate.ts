import { env } from "node:process";
import type { ToEventProps } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import {
	type APIChannel,
	ChannelType,
	GatewayDispatchEvents,
	type GatewayMessageCreateDispatchData,
	MessageType,
	RESTJSONErrorCodes,
} from "discord-api-types/v10";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";
import { handleMastraQA } from "../utilities/mastraQA.js";

export default class MessageCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.MessageCreate);
	}

	/**
	 * Handle the creation of a new message.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#message-create
	 */
	public override async run({ shardId, data: message }: ToEventProps<GatewayMessageCreateDispatchData>) {
		if (message.author.bot || message.type !== MessageType.Default) return;

		await this.client.prisma.message.create({
			data: {
				id: message.id,
				authorId: message.author.id,
				channelId: message.channel_id,
				content: message.content,
				createdAt: new Date(message.timestamp),
				guildId: message.guild_id!,
			},
		});

		let channel: APIChannel | null = null;
		try {
			channel = await this.client.api.channels.get(message.channel_id);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) {
				this.client.logger.error(`Unable to fetch channel ${message.channel_id}.`);
			}
			return;
		}

		// Handle bot mentions for Mastra Q&A

		if (message.mentions?.some((user) => user.id === env.APPLICATION_ID)) {
			// Skip bot mention handling if Mastra API key is not configured
			// This keeps the bot reproducible for open source contributors without API access
			if (!env.RUNPOD_ASSISTANT_API_KEY) {
				return;
			}

			await handleMastraQA(this.client, message, channel);
		}

		this.client.dataDog?.increment("total_messages_sent", 1, [
			`guildId:${message.guild_id ?? "@me"}`,
			`userId:${message.author.id}`,
			`channelId:${message.channel_id}`,
			`channelName:${channel?.name}`,
		]);

		if (channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread) {
			const parentChannel = await this.client.api.channels.get(message.channel_id);

			if (
				parentChannel.type === ChannelType.GuildText ||
				(parentChannel.type === ChannelType.GuildForum &&
					parentChannel.parent_id !== this.client.config.supportCategoryId)
			)
				this.client.dataDog?.increment("total_messages_sent.engaging", 1, [
					`guildId:${message.guild_id ?? "@me"}`,
					`userId:${message.author.id}`,
					`channelId:${message.channel_id}`,
					`channelName:${channel?.name}`,
				]);
		} else if (channel?.type === ChannelType.GuildText && channel.parent_id !== this.client.config.supportCategoryId) {
			this.client.dataDog?.increment("total_messages_sent.engaging", 1, [
				`guildId:${message.guild_id ?? "@me"}`,
				`userId:${message.author.id}`,
				`channelId:${message.channel_id}`,
				`channelName:${channel?.name}`,
			]);
		}

		if (message.guild_id) {
			if (["1064658510689874040"].includes(message.channel_id)) {
				await fetch("https://changelog.getrunpod.io/webhooks/discord", {
					method: "POST",
					body: JSON.stringify({
						secret: env.CHANGELOG_WEBHOOK_SECRET,
						content: message.content,
						author: message.author.username,
						createdAt: new Date(message.timestamp).toISOString(),
					}),
				});
			}

			// TODO: Use new_communicators and new_communicators_first_day metrics in Datadog, this will help us track if average messages sent
			// by new users are consistent with new_communicators (do we on average see a couple of messages per new user, or do we see a lot of
			// messages for certain new users, etc.) This will also enable us to track if new users might be having trouble getting around in the
			// Discord server, and if we need an easier onboarding flow for it.
			const memberJoinedAt = new Date(message.member!.joined_at!).getTime();
			const oneWeekAgo = Date.now() - 604_800_000;

			if (memberJoinedAt > oneWeekAgo) {
				this.client.dataDog?.increment("total_messages_sent.new_user", 1, [
					`guildId:${message.guild_id ?? "@me"}`,
					`userId:${message.author.id}`,
					`channelId:${message.channel_id}`,
					`channelName:${channel?.name}`,
				]);
			}

			const newCommunicator = await this.client.prisma.newCommunicator.findUnique({
				where: {
					userId_guildId: {
						userId: message.author.id,
						guildId: message.guild_id,
					},
				},
			});

			if (!newCommunicator) {
				await this.client.prisma.newCommunicator.create({
					data: {
						userId: message.author.id,
						guildId: message.guild_id,
						joinedAt: new Date(message.member!.joined_at!),
					},
				});

				this.client.dataDog?.increment("new_communicators", 1, [`guildId:${message.guild_id}`]);

				if (memberJoinedAt + 86_400_000 > Date.now()) {
					this.client.dataDog?.increment("new_communicators_first_day", 1, [`guildId:${message.guild_id}`]);
				}
			}

			const autoThreadChannel = await this.client.prisma.autoThreadChannel.findUnique({
				where: { channelId: message.channel_id },
			});

			if (autoThreadChannel) {
				const name = autoThreadChannel.threadName
					? autoThreadChannel.threadName
							.replaceAll("{{author}}", `${message.author.username}`)
							.replaceAll("{{content}}", message.content)
					: message.content;

				await this.client.api.channels.createThread(
					message.channel_id,
					{
						name: name.length > 100 ? `${name.slice(0, 97)}...` : name,
					},
					message.id,
				);
			}
		}

		return this.client.textCommandHandler.handleTextCommand({
			data: message,
			shardId,
		});
	}
}
