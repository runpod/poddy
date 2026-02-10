import type { GatewayGuildScheduledEventDeleteDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents, GuildScheduledEventEntityType } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class GuildScheduledEventDelete extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildScheduledEventDelete);
	}

	/**
	 * Sent when a guild scheduled event is deleted.
	 *
	 * https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-delete
	 */
	public override async run({ data }: ToEventProps<GatewayGuildScheduledEventDeleteDispatchData>) {
		await this.client.prisma.scheduledEvent.upsert({
			where: {
				id: data.id,
			},
			update: {
				name: data.name,
				description: data.description ?? null,
				startTime: new Date(data.scheduled_start_time),
				endTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : null,
				entityType: GuildScheduledEventEntityType[data.entity_type],
				userCount: data.user_count ?? null,
				creatorId: data.creator_id ?? null,
				deletedAt: new Date(),
			},
			create: {
				id: data.id,
				name: data.name,
				description: data.description ?? null,
				startTime: new Date(data.scheduled_start_time),
				endTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : null,
				entityType: GuildScheduledEventEntityType[data.entity_type],
				userCount: data.user_count ?? null,
				creatorId: data.creator_id ?? null,
			},
		});
	}
}
