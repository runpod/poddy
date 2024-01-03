import type { GatewayThreadCreateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class ThreadCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ThreadCreate);
	}

	/**
	 * Sent when a thread is created, relevant to the current user, or when the current user is added to a thread. The inner payload is a channel object.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#thread-create
	 */
	public override async run({ data: channel }: WithIntrinsicProps<GatewayThreadCreateDispatchData>) {
		console.log(channel);
		if (channel.type !== ChannelType.PublicThread) return;

		if (!channel.applied_tags) {
			const parentChannel = await this.client.api.channels.get(channel.parent_id!);

			if (parentChannel.type !== ChannelType.GuildForum) return;
		}

		const autoTagOnForumChannel = await this.client.prisma.autoTagOnForumChannel.findMany({
			where: {
				channelId: channel.parent_id!,
			},
		});

		if (!autoTagOnForumChannel.length) {
			this.client.dataDog.increment("forum_posts", 1, [
				`channelId:${channel.parent_id}`,
				`guildId:${channel.guild_id}`,
				`userId:${channel.owner_id}`,
				...(channel.applied_tags ?? []).map((tag) => `tagId:${tag}`),
			]);

			return;
		}

		const tagIds = (channel.applied_tags ?? []).concat(autoTagOnForumChannel.map(({ tagId }) => tagId));

		this.client.dataDog.increment("forum_posts", 1, [
			`channelId:${channel.parent_id}`,
			`guildId:${channel.guild_id}`,
			`userId:${channel.owner_id}`,
			...tagIds.map((tag) => `tagId:${tag}`),
		]);

		return this.client.api.channels.edit(channel.id, {
			applied_tags: tagIds.concat(autoTagOnForumChannel.map(({ tagId }) => tagId)),
		});
	}
}
