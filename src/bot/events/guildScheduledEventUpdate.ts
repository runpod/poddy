import type { ToEventProps } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { GatewayGuildScheduledEventUpdateDispatchData } from "discord-api-types/v10";
import { GatewayDispatchEvents, GuildScheduledEventEntityType } from "discord-api-types/v10";

export default class GuildScheduledEventUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildScheduledEventUpdate);
	}

	/**
	 * Sent when a guild scheduled event is updated.
	 *
	 * https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-update
	 */
	public override async run({ data }: ToEventProps<GatewayGuildScheduledEventUpdateDispatchData>) {
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
