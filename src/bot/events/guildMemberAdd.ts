import type { GatewayGuildMemberAddDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildMemberAdd extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildMemberAdd, false);
	}

	/**
	 * Sent when a new user joins a guild. The inner payload is a guild member object with an extra guild_id key:
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-member-add
	 */
	public override async run({ data: member }: WithIntrinsicProps<GatewayGuildMemberAddDispatchData>) {
		this.client.approximateUserCount++;

		this.client.dataDog.increment("guild_members", 1, [`guildId:${member.guild_id}`]);
		this.client.dataDog.increment("guild_joins", 1, [`guildId:${member.guild_id}`]);
	}
}
