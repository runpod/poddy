import type { GatewayGuildMemberRemoveDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildMemberAdd extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildMemberRemove, false);
	}

	/**
	 * Sent when a user is removed from a guild (leave/kick/ban).
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-member-remove
	 */
	public override async run({ data: member }: WithIntrinsicProps<GatewayGuildMemberRemoveDispatchData>) {
		this.client.approximateUserCount--;

		this.client.dataDog.increment("guild_members", -1, [`guildId:${member.guild_id}`]);
		this.client.dataDog.increment("guild_leaves", 1, [`guildId:${member.guild_id}`]);
	}
}
