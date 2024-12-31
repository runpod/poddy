import type { GatewayVoiceStateUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildMemberAdd extends EventHandler {
	/**
	 * A cache of voice states for users in a guild.
	 */
	private readonly voiceStateCache = new Map<
		string,
		Map<
			string,
			{
				channelId: string | null;
				deafened: boolean;
				muted: boolean;
			}
		>
	>();

	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.VoiceStateUpdate, false);
	}

	/**
	 * Sent when someone joins/leaves/moves voice channels. Inner payload is a voice state object.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#voice-state-update
	 */
	public override async run({ data: voiceState }: WithIntrinsicProps<GatewayVoiceStateUpdateDispatchData>) {
		const usersInVoiceChannel = this.client.usersInVoice.get(voiceState.guild_id ?? "@me");

		if (usersInVoiceChannel?.has(voiceState.user_id)) {
			if (!voiceState.channel_id) usersInVoiceChannel.delete(voiceState.user_id);
		} else if (voiceState.channel_id) {
			this.client.usersInVoice.set(
				voiceState.guild_id ?? "@me",
				(usersInVoiceChannel ?? new Set()).add(voiceState.user_id),
			);
		}

		if (!voiceState.guild_id) return;

		const guildVoiceStateCache =
			this.voiceStateCache.get(voiceState.guild_id) ??
			new Map<
				string,
				{
					channelId: string | null;
					deafened: boolean;
					muted: boolean;
				}
			>();

		if (!guildVoiceStateCache)
			this.voiceStateCache.set(
				voiceState.guild_id,
				new Map([
					[
						voiceState.user_id,
						{
							channelId: voiceState.channel_id,
							deafened: voiceState.deaf,
							muted: voiceState.mute,
						},
					],
				]),
			);

		const userVoiceState = guildVoiceStateCache.get(voiceState.user_id);
		guildVoiceStateCache.set(voiceState.user_id, {
			channelId: voiceState.channel_id,
			deafened: voiceState.deaf,
			muted: voiceState.mute,
		});
		this.voiceStateCache.set(voiceState.guild_id, guildVoiceStateCache);

		if (
			userVoiceState?.channelId === voiceState.channel_id &&
			userVoiceState.deafened === voiceState.deaf &&
			userVoiceState.muted === voiceState.mute
		)
			return;

		const changes: string[] = [];

		if (userVoiceState?.channelId !== voiceState.channel_id)
			changes.push(
				`**Channel:** ${userVoiceState?.channelId ? `<#${userVoiceState.channelId}> ->` : "Joined"} ${
					voiceState.channel_id ? `<#${voiceState.channel_id}>` : "Left"
				}`,
			);
		if (userVoiceState?.deafened !== undefined && userVoiceState.deafened !== voiceState.deaf)
			changes.push(`**Deafened:** ${userVoiceState?.deafened ? "Yes" : "No"} -> ${voiceState.deaf ? "Yes" : "No"}`);
		if (userVoiceState?.muted !== undefined && userVoiceState.muted !== voiceState.mute)
			changes.push(`**Muted:** ${userVoiceState?.muted ? "Yes" : "No"} -> ${voiceState.mute ? "Yes" : "No"}`);

		if (!changes.length) return;

		const loggingChannels = await this.client.prisma.logChannel.findMany({
			where: {
				event: "VOICE_STATE_UPDATE",
				guildId: voiceState.guild_id!,
			},
		});

		if (!loggingChannels.length) return;

		return Promise.all(
			loggingChannels.map(async (channel) =>
				this.client.api.channels.createMessage(channel.channelId, {
					embeds: [
						{
							author: {
								name: "Voice State Update",
								icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditStageUpdate.png",
							},
							description: `**User:** <@${voiceState.user_id}> \`[${voiceState.user_id}]\`\n\n${changes.join("\n")}`,
							color: this.client.config.colors.warning,
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
