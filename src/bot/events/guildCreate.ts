import type { GatewayGuildCreateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildCreate, false);
	}

	/**
	 * Lazy-load for unavailable guild, guild became available, or user joined a new guild.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-create
	 */
	public override async run({ shardId, data: guild }: WithIntrinsicProps<GatewayGuildCreateDispatchData>) {
		const guildRoles = new Map();

		for (const guildRole of guild.roles) guildRoles.set(guildRole.id, guildRole);

		this.client.guildRolesCache.set(guild.id, guildRoles);
		this.client.approximateUserCount += guild.member_count;

		this.client.dataDog.gauge("guild_members", guild.member_count, [`guildId:${guild.id}`]);

		if (this.client.guildOwnersCache.get(guild.id) === undefined) {
			this.client.dataDog.increment("guild_count", 1, [`shard:${shardId}`]);

			this.client.guildOwnersCache.set(guild.id, guild.owner_id);

			this.client.logger.info(
				`Joined ${guild.name} [${guild.id}] with ${guild.member_count} members on Shard ${shardId}. Now at ${this.client.guildOwnersCache.size} guilds with ${this.client.approximateUserCount} total users.`,
			);

			return this.client.logger.webhookLog("guild", {
				content: `**__Joined a New Guild (${this.client.guildOwnersCache.size} Total)__**\n**Guild Name:** \`${
					guild.name
				}\`\n**Guild ID:** \`${guild.id}\`\n**Guild Owner:** <@${
					guild.owner_id
				}> \`[${guild.owner_id}]\`\n**Guild Member Count:** \`${
					guild.member_count
				}\`\n**Timestamp:** ${this.client.functions.generateTimestamp()}\n**Shard ID:** \`${shardId}\``,
				username: `${this.client.config.botName} | Console Logs`,
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		if (this.client.guildOwnersCache.get(guild.id) !== guild.owner_id)
			return this.client.guildOwnersCache.set(guild.id, guild.owner_id);

		return true;
	}
}
