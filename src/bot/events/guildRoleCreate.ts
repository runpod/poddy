import type { GatewayGuildRoleCreateDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";

export default class GuildRoleCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildRoleCreate);
	}

	/**
	 * Sent when a guild role is created.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
	 */
	public override async run({ data }: ToEventProps<GatewayGuildRoleCreateDispatchData>) {
		const previousGuildRoles = this.client.guildRolesCache.get(data.guild_id) ?? new Map();
		previousGuildRoles.set(data.role.id, data.role);

		this.client.guildRolesCache.set(data.guild_id, previousGuildRoles);

		await this.client.prisma.role.create({
			data: {
				id: data.role.id,
				name: data.role.name,
				permissions: data.role.permissions,
			},
		});
	}
}
