import type { GatewayThreadUpdateDispatchData, ToEventProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class ThreadUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ThreadUpdate);
	}

	/**
	 * Sent when a thread is updated. The inner payload is a channel object.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#thread-update
	 */
	public override async run({ data: thread }: ToEventProps<GatewayThreadUpdateDispatchData>) {
		const appliedTags: string[] = [];
		if (thread.applied_tags) {
			appliedTags.push(...thread.applied_tags);
		}

		await this.client.prisma.channel.upsert({
			where: {
				id: thread.id,
			},
			update: {
				type: thread.type,
				name: thread.name,
				appliedTags,
			},
			create: {
				id: thread.id,
				name: thread.name,
				type: thread.type,
				appliedTags,
			},
		});

		if ((thread.type === ChannelType.PublicThread || thread.type === ChannelType.PrivateThread) && thread.parent_id) {
			const parentChannel = await this.client.api.channels.get(thread.parent_id);

			if (parentChannel.type === ChannelType.GuildForum) {
				await this.client.prisma.threadEvent.create({
					data: {
						threadId: thread.id,
						appliedTags,
						timestamp: new Date(),
					},
				});
			}
		}
	}
}
