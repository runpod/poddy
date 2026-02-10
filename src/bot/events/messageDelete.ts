import { setTimeout } from "node:timers";
import { LogEvent } from "@db/client.js";
import type { ToEventProps } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import {
	type APIEmbed,
	type APIGuildTextChannel,
	GatewayDispatchEvents,
	type GatewayMessageUpdateDispatchData,
	type GuildTextChannelType,
	RESTJSONErrorCodes,
} from "discord-api-types/v10";

export default class MessageDelete extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.MessageDelete);
	}

	/**
	 * Message was deleted
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#message-delete
	 */
	public override async run({ data: message }: ToEventProps<GatewayMessageUpdateDispatchData>) {
		if (message.author?.bot) return;

		const oldMessage = await this.client.prisma.message.findUnique({
			where: {
				id: message.id,
			},
		});

		if (!oldMessage) return;

		await this.client.prisma.message.update({
			where: {
				id: message.id,
			},
			data: {
				content: null,
				deletedAt: new Date(),
			},
		});

		const authorId = oldMessage?.authorId ?? message.author?.id ?? null;

		const loggingChannels = await this.client.prisma.logChannel.findMany({
			where: {
				event: LogEvent.MESSAGE_DELETED,
				guildId: message.guild_id!,
			},
		});

		if (!this.client.channelNameCache.has(message.channel_id)) {
			try {
				const channel = (await this.client.api.channels.get(
					message.channel_id,
				)) as APIGuildTextChannel<GuildTextChannelType>;

				this.client.channelNameCache.set(message.channel_id, channel.name);
				setTimeout(() => this.client.channelNameCache.delete(message.channel_id), 30_000);
			} catch (error) {
				if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel)
					this.client.channelNameCache.set(message.channel_id, "unknown-channel");
				else throw error;
			}
		}

		const channelName = this.client.channelNameCache.get(message.channel_id);

		const embedToSend = {
			author: {
				name: "Message Deleted",
				icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditMessageDelete.png",
			},
			description: `**User:** ${authorId ? `<@${authorId}> \`[${authorId}]\`` : "Unknown User"}\n**Channel:** <#${
				message.channel_id
			}> \`(#${channelName})\` \`[${message.channel_id}]\`\n${
				oldMessage.createdAt
					? `**Message Created:** ${this.client.functions.generateTimestamp({
							timestamp: oldMessage.createdAt,
						})} (${this.client.functions.generateTimestamp({
							timestamp: oldMessage.createdAt,
							type: "R",
						})})\n`
					: ""
			}\n**Content:**\n${oldMessage?.content ?? message.content}`,
			color: this.client.config.colors.error,
			footer: {
				text: `Message ID: ${message.id}`,
			},
		} as APIEmbed;

		return Promise.all(
			loggingChannels.map(async (loggingChannel) =>
				this.client.api.channels.createMessage(loggingChannel.channelId, {
					embeds: [embedToSend],
					allowed_mentions: {
						parse: [],
					},
				}),
			),
		);
	}
}
