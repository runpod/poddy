import type { GatewayGuildScheduledEventCreateDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents, GuildScheduledEventEntityType } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class GuildScheduledEventCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildScheduledEventCreate);
	}

	/**
	 * Sent when a guild scheduled event is created.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
	 */
	public override async run({ data }: ToEventProps<GatewayGuildScheduledEventCreateDispatchData>) {
		await this.client.prisma.scheduledEvent.create({
			data: {
				id: data.id,
				name: data.name,
				description: data.description ?? null,
				startTime: new Date(data.scheduled_start_time),
				endTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : null,
				entityType: GuildScheduledEventEntityType[data.entity_type],
				userCount: data.user_count ?? null, // likely zero at this point
				creatorId: data.creator_id ?? null,
			},
		});
	}
}
