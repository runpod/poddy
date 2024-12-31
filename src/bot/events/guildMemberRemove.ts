import type { GatewayGuildMemberRemoveDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { DiscordSnowflake } from "@sapphire/snowflake";
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

		const loggingChannels = await this.client.prisma.logChannel.findMany({
			where: {
				event: "MEMBER_LEFT",
				guildId: member.guild_id,
			},
		});

		if (!loggingChannels.length) return;

		const [previousMessageCount, mostRecentJoin] = await Promise.all([
			this.client.prisma.message.count({
				where: {
					guildId: member.guild_id,
					authorId: member.user!.id,
				},
			}),
			this.client.prisma.memberJoin.findFirst({
				where: {
					guildId: member.guild_id,
					userId: member.user!.id,
				},
				orderBy: {
					joinedAt: "desc",
				},
			}),
		]);

		return Promise.all(
			loggingChannels.map(async (channel) =>
				this.client.api.channels.createMessage(channel.channelId, {
					embeds: [
						{
							author: {
								name: "Member Left",
								icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditMemberDelete.png",
							},
							description: `**User:** <@${member.user!.id}> \`[${
								member.user!.id
							}]\`\n**Account Created:** ${this.client.functions.generateTimestamp({
								timestamp: DiscordSnowflake.timestampFrom(member.user!.id),
							})} (${this.client.functions.generateTimestamp({
								timestamp: DiscordSnowflake.timestampFrom(member.user!.id),
								type: "R",
							})})${
								mostRecentJoin
									? `\n**Joined At:** ${this.client.functions.generateTimestamp({
											timestamp: mostRecentJoin.joinedAt,
										})} (${this.client.functions.generateTimestamp({
											timestamp: mostRecentJoin.joinedAt,
											type: "R",
										})})`
									: ""
							}\n${
								previousMessageCount > 1 ? `\n**Previous Message Count:** ${previousMessageCount.toLocaleString()}` : ""
							}`,
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: {
						parse: [],
					},
				}),
			),
		);
	}
}
