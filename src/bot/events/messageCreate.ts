import { env } from "node:process";
import type { ToEventProps } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { handleMastraQA } from "@src/utilities/mastraQA";
import {
	type APIChannel,
	ChannelType,
	GatewayDispatchEvents,
	type GatewayMessageCreateDispatchData,
	MessageType,
	RESTJSONErrorCodes,
} from "discord-api-types/v10";

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
