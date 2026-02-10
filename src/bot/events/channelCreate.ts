import type { GatewayChannelCreateDispatchData, ToEventProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class ChannelCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ChannelCreate);
	}

	/**
	 * Sent when a channel is created, relevant to the current user
	 *
	 * https://discord.com/developers/docs/events/gateway-events#channel-create
	 */
	public override async run({ data }: ToEventProps<GatewayChannelCreateDispatchData>) {
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
				availableTags,
			},
			create: {
				id: data.id,
				name: data.name,
				type: data.type,
				availableTags,
			},
		});
	}
}
