import { setTimeout } from "node:timers";
import type {
	APIEmbed,
	APIGuildTextChannel,
	GatewayMessageUpdateDispatchData,
	GuildTextChannelType,
	WithIntrinsicProps,
} from "@discordjs/core";
import { GatewayDispatchEvents, RESTJSONErrorCodes } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class MessageUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.MessageUpdate);
	}

	/**
	 * Message was edited
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#message-update
	 */
	public override async run({ data: message }: WithIntrinsicProps<GatewayMessageUpdateDispatchData>) {
		if (message.author?.bot) return;

		const oldMessage = await this.client.prisma.message.findUnique({
			where: {
				id: message.id,
			},
		});

		if (oldMessage?.content === message.content) return;

		if (message.content && message.content !== oldMessage?.content)
			await this.client.prisma.message.upsert({
				where: {
					id: message.id,
				},
				create: {
					authorId: message.author!.id,
					guildId: message.guild_id!,
					id: message.id,
					content: message.content,
					createdAt: new Date(message.timestamp!),
				},
				update: {
					content: message.content,
				},
			});

		const loggingChannels = await this.client.prisma.logChannel.findMany({
			where: {
				event: "MESSAGE_EDITED",
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
				name: "Message Edited",
				icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditThreadUpdate.png",
			},
			description: `**User:** <@${message.author!.id}> \`[${message.author!.id}]\`\n**Channel:** <#${
				message.channel_id
			}> \`(#${channelName})\` \`[${message.channel_id}]\`\n${
				oldMessage ? `\n**Before:**\n${oldMessage.content}\n` : ""
			}\n**After:**\n${message.content}`,
			color: this.client.config.colors.warning,
			footer: {
				text: `Message ID: ${message.id}${message.timestamp ? " | Message Created At:" : ""}`,
			},
		} as APIEmbed;

		if (message.timestamp) embedToSend.timestamp = message.timestamp;

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
