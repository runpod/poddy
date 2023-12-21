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
		if (channel.type !== ChannelType.PublicThread) return;

		const autoTagOnForumChannel = await this.client.prisma.autoTagOnForumChannel.findMany({
			where: {
				channelId: channel.parent_id!,
			},
		});

		if (!autoTagOnForumChannel.length) return;

		return this.client.api.channels.edit(channel.id, {
			applied_tags: channel.applied_tags.concat(autoTagOnForumChannel.map(({ tagId }) => tagId)),
		});
	}
}
