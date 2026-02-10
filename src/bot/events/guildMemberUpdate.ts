import { env } from "node:process";
import type { APIGuildMember, GatewayGuildMemberUpdateDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class GuildMemberUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildMemberUpdate);
	}

	/**
	 * Sent when a guild member is updated. This will also fire when the user object of a guild member changes.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-member-update
	 */
	public override async run({ data }: ToEventProps<GatewayGuildMemberUpdateDispatchData>) {
		if (data.user.id === env.APPLICATION_ID) {
			this.client.guildMeCache.set(data.guild_id, data as APIGuildMember);
		}
	}
}
