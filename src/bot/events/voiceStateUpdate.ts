import type { GatewayVoiceStateUpdateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildMemberAdd extends EventHandler {
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
	}
}
