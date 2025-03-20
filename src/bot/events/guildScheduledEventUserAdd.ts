import type { GatewayGuildScheduledEventUserAddDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents, GuildScheduledEventEntityType } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import Logger from "../../../lib/classes/Logger.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildScheduledEventUserAdd extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildScheduledEventUserAdd);
	}

	/**
	 * Sent when a user has subscribed to a guild scheduled event.
	 *
	 * https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add
	 */
	public override async run({ data }: ToEventProps<GatewayGuildScheduledEventUserAddDispatchData>) {
		try {
			await this.client.prisma.scheduledEvent.update({
				where: {
					id: data.guild_scheduled_event_id,
				},
				data: {
					userCount: {
						increment: 1, // probably should ask the api for a true user count?
					},
				},
			});
		} catch {
			Logger.debug("Got a GUILD_SCHEDULED_EVENT_USER_ADD for an event that does not exist, rehydrating...");
			const event = await this.client.api.guilds.getScheduledEvent(data.guild_id, data.guild_scheduled_event_id, {
				with_user_count: true,
			});
			await this.client.prisma.scheduledEvent.create({
				data: {
					id: event.id,
					name: event.name,
					description: event.description ?? null,
					startTime: new Date(event.scheduled_start_time),
					endTime: event.scheduled_end_time ? new Date(event.scheduled_end_time) : null,
					entityType: GuildScheduledEventEntityType[event.entity_type],
					userCount: event.user_count ?? null,
					creatorId: event.creator_id ?? null,
				},
			});
		}
	}
}
