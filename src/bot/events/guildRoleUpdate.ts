import type { ToEventProps } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { GatewayGuildRoleUpdateDispatchData } from "discord-api-types/v10";
import { GatewayDispatchEvents } from "discord-api-types/v10";

export default class GuildRoleUpdate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildRoleUpdate);
	}

	/**
	 * Sent when a guild role is updated.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-role-update
	 */
	public override async run({ data }: ToEventProps<GatewayGuildRoleUpdateDispatchData>) {
		const previousGuildRoles = this.client.guildRolesCache.get(data.guild_id) ?? new Map();
		previousGuildRoles.set(data.guild_id, data.role);

		this.client.guildRolesCache.set(data.guild_id, previousGuildRoles);

		await this.client.prisma.role.upsert({
			where: {
				id: data.role.id,
			},
			update: {
				name: data.role.name,
				permissions: data.role.permissions,
				editedAt: new Date(),
			},
			create: {
				id: data.role.id,
				name: data.role.name,
				permissions: data.role.permissions,
			},
		});
	}
}
