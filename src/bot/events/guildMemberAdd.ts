import type { GatewayGuildMemberAddDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { DiscordSnowflake } from "@sapphire/snowflake";
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

		const newInvites = await this.client.api.guilds.getInvites(member.guild_id);

		if (!this.client.invitesCache.has(member.guild_id))
			this.client.invitesCache.set(member.guild_id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));

		const invitesCache = this.client.invitesCache.get(member.guild_id)!;
		const usedInvite = newInvites.find((invite) => invite.uses > (invitesCache?.get(invite.code) ?? 0));

		if (usedInvite) {
			this.client.dataDog.increment("guild_joins", 1, [`guildId:${member.guild_id}`, `invite:${usedInvite.code}`]);

			invitesCache.set(usedInvite.code, usedInvite.uses);
			this.client.invitesCache.set(member.guild_id, invitesCache);
		} else this.client.dataDog.increment("guild_joins", 1, [`guildId:${member.guild_id}`]);

		const [loggingChannels] = await Promise.all([
			this.client.prisma.logChannel.findMany({
				where: {
					event: "MEMBER_JOINED",
					guildId: member.guild_id,
				},
			}),
			this.client.prisma.memberJoin.create({
				data: {
					guildId: member.guild_id,
					joinedAt: new Date(),
					userId: member.user!.id,
					inviteCode: usedInvite?.code ?? null,
				},
			}),
		]);

		if (!loggingChannels.length) return;

		const [previousMessageCount, previousJoinCount] = await Promise.all([
			this.client.prisma.message.count({
				where: {
					guildId: member.guild_id,
					authorId: member.user!.id,
				},
			}),
			this.client.prisma.memberJoin.count({
				where: {
					guildId: member.guild_id,
					userId: member.user!.id,
				},
			}),
		]);

		return Promise.all(
			loggingChannels.map(async (channel) =>
				this.client.api.channels.createMessage(channel.channelId, {
					embeds: [
						{
							author: {
								name: "Member Joined",
								icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditMemberCreate.png",
							},
							description: `**User:** <@${member.user!.id}> \`[${
								member.user!.id
							}]\`\n**Account Created:** ${this.client.functions.generateTimestamp({
								timestamp: DiscordSnowflake.timestampFrom(member.user!.id),
							})} (${this.client.functions.generateTimestamp({
								timestamp: DiscordSnowflake.timestampFrom(member.user!.id),
								type: "R",
							})})\n${previousJoinCount > 1 ? `\n**Previous Join Count:** ${previousJoinCount.toLocaleString()}` : ""}${
								previousMessageCount > 1 ? `\n**Previous Message Count:** ${previousMessageCount.toLocaleString()}` : ""
							}${usedInvite ? `\n**Invite:** https://discord.gg/${usedInvite.code}` : ""}`,
							color: this.client.config.colors.success,
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
