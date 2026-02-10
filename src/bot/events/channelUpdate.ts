import type { GatewayChannelUpdateDispatchData, ToEventProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class ChannelUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ChannelUpdate);
	}

	/**
	 * Sent when a channel is updated. The inner payload is a channel object.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#channel-update
	 */
	public override async run({ data }: ToEventProps<GatewayChannelUpdateDispatchData>) {
		const availableTags: string[] = [];
		if (data.type === ChannelType.GuildForum && data.available_tags) {
			availableTags.push(...data.available_tags.map((tag) => tag.id));
		}

		await this.client.prisma.channel.upsert({
			where: {
				id: data.id,
			},
			update: {
				type: data.type,
				name: data.name,
				availableTags,
			},
			create: {
				id: data.id,
				name: data.name,
				type: data.type,
				availableTags,
				appliedTags: [],
			},
		});
	}
}
