import type { GatewayGuildAuditLogEntryCreateDispatchData, ToEventProps } from "@discordjs/core";
import { AuditLogEvent, ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class GuildAuditLogEntryCreate extends EventHandler {
	/**
	 * A map of channel types to their names.
	 */
	private readonly channelTypesMap = {
		[ChannelType.DM]: "Direct Message",
		[ChannelType.GroupDM]: "Group Chat",
		[ChannelType.GuildText]: "Text Channel",
		[ChannelType.GuildVoice]: "Voice Channel",
		[ChannelType.GuildCategory]: "Category",
		[ChannelType.GuildAnnouncement]: "Announcement Channel",
		[ChannelType.AnnouncementThread]: "Announcement Thread",
		[ChannelType.PublicThread]: "Public Thread",
		[ChannelType.GuildForum]: "Forum Channel",
		[ChannelType.GuildStageVoice]: "Stage Channel",
		[ChannelType.GuildMedia]: "Media Channel",
		[ChannelType.PrivateThread]: "Private Thread",
		[ChannelType.GuildDirectory]: "Directory",
	};

	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.GuildAuditLogEntryCreate);
	}

	/**
	 * A guild audit log entry was created
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#guild-audit-log-entry-create
	 */
	public override async run({ data: auditLogEntry }: ToEventProps<GatewayGuildAuditLogEntryCreateDispatchData>) {
		console.log(auditLogEntry);

		if (auditLogEntry.action_type === AuditLogEvent.ChannelCreate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "CHANNEL_CREATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			const channel = {
				name: auditLogEntry.changes!.find((change) => change.key === "name")!.new_value,
				type: auditLogEntry.changes!.find((change) => change.key === "type")!.new_value as ChannelType,
			};

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Channel Created",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditChannelCreate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n**Channel Name:** ${channel.name}\n**Channel Type:** ${this.channelTypesMap[channel.type]}`,
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

		if (auditLogEntry.action_type === AuditLogEvent.ChannelDelete) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "CHANNEL_DELETED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Channel Name:** ${change.old_value}`,
								order: 1,
							};

						if (change.key === "type")
							return {
								name: `**Channel Type:** ${this.channelTypesMap[change.old_value as ChannelType]}`,
								order: 2,
							};

						if (change.key === "nsfw") return change.old_value ? { name: "**NSFW:** Yes", order: 3 } : null;

						if (change.key === "rate_limit_per_user")
							return change.old_value
								? {
										name: `**Slowmode:** ${this.client.functions.format(change.old_value * 1_000)}`,
										order: 4,
									}
								: null;

						if (change.key === "topic")
							return change.old_value
								? {
										name: `**Topic:** ${change.old_value}`,
										order: 5,
									}
								: null;

						if (change.key === "user_limit")
							return change.old_value
								? {
										name: `**User Limit:** ${change.old_value}`,
										order: 6,
									}
								: null;

						if (change.key === "default_auto_archive_duration")
							return change.old_value
								? {
										name: `**Hide Threads After Inactivity:** ${this.client.functions.format(
											change.old_value * 1_000 * 60,
										)}`,
										order: 7,
									}
								: null;

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Channel Deleted",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditChannelDelete.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
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

		if (auditLogEntry.action_type === AuditLogEvent.ChannelUpdate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "CHANNEL_UPDATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Channel Name:** ${change.old_value} -> ${change.new_value}`,
								order: 1,
							};

						if (change.key === "type")
							return {
								name: `**Channel Type:** ${this.channelTypesMap[change.old_value as ChannelType]} -> ${
									this.channelTypesMap[change.new_value as ChannelType]
								}`,
								order: 2,
							};

						if (change.key === "nsfw")
							return {
								name: `**NSFW:** ${change.old_value ? "Yes" : "No"} -> ${change.new_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "rate_limit_per_user")
							return {
								name: `**Slowmode:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000) : "None"
								} -> ${change.new_value ? this.client.functions.format(change.new_value * 1_000) : "None"}`,
								order: 4,
							};

						if (change.key === "topic")
							return {
								name: `**Topic:** ${change.old_value ?? "None"} -> ${change.new_value ?? "None"}`,
								order: 5,
							};

						if (change.key === "user_limit")
							return {
								name: `**User Limit:** ${change.old_value ?? "None"} -> ${change.new_value ?? "None"}`,
								order: 6,
							};

						if (change.key === "default_auto_archive_duration")
							return {
								name: `**Hide Threads After Inactivity:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000 * 60) : "None"
								} -> ${change.new_value ? this.client.functions.format(change.new_value * 1_000 * 60) : "None"}`,
								order: 7,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Channel Updated",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditChannelUpdate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								color: this.client.config.colors.warning,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.RoleCreate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "ROLE_CREATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Role Name:** ${change.new_value}`,
								order: 1,
							};

						if (change.key === "color")
							return {
								name: `**Role Color:** ${change.new_value ? `#${change.new_value.toString(16)}` : "None"}`,
								order: 2,
							};

						if (change.key === "hoist")
							return {
								name: `**Role Hoist:** ${change.new_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "mentionable")
							return {
								name: `**Role Mentionable:** ${change.new_value ? "Yes" : "No"}`,
								order: 4,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Role Created",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditRoleCreate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Role ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.success,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.RoleDelete) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "ROLE_DELETED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Role Name:** ${change.old_value}`,
								order: 1,
							};

						if (change.key === "color")
							return {
								name: `**Role Color:** ${change.old_value ? `#${change.old_value.toString(16)}` : "None"}`,
								order: 2,
							};

						if (change.key === "hoist")
							return {
								name: `**Role Hoist:** ${change.old_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "mentionable")
							return {
								name: `**Role Mentionable:** ${change.old_value ? "Yes" : "No"}`,
								order: 4,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Role Deleted",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditRoleDelete.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Role ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.error,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.RoleUpdate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "ROLE_UPDATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Role Name:** ${change.old_value} -> ${change.new_value}`,
								order: 1,
							};

						if (change.key === "color")
							return {
								name: `**Role Color:** ${change.old_value ? `#${change.old_value.toString(16)}` : "None"} -> ${
									change.new_value ? `#${change.new_value.toString(16)}` : "None"
								}`,
								order: 2,
							};

						if (change.key === "hoist")
							return {
								name: `**Role Hoist:** ${change.old_value ? "Yes" : "No"} -> ${change.new_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "mentionable")
							return {
								name: `**Role Mentionable:** ${change.old_value ? "Yes" : "No"} -> ${change.new_value ? "Yes" : "No"}`,
								order: 4,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Role Updated",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditRoleUpdate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Role ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.warning,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.MemberRoleUpdate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "MEMBER_ROLE_UPDATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "$add" && change.new_value)
							return {
								name: `**Roles Added:** ${change.new_value.map((role) => `<@&${role.id}>`).join(", ")}`,
								order: 1,
							};

						if (change.key === "$remove" && change.new_value)
							return {
								name: `**Roles Removed:** ${change.new_value.map((role) => `<@&${role.id}>`).join(", ")}`,
								order: 2,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Member Updated",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditMemberUpdate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Member ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.warning,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.MemberUpdate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "MEMBER_UPDATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "nick")
							return {
								name: `**Nickname:** ${change.old_value ?? "None"} -> ${change.new_value ?? "None"}`,
								order: 3,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Member Updated",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditMemberUpdate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Member ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.warning,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.ThreadCreate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "THREAD_CREATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Thread Name:** ${change.new_value}`,
								order: 1,
							};

						if (change.key === "type")
							return {
								name: `**Thread Type:** ${this.channelTypesMap[change.new_value as ChannelType]}`,
								order: 2,
							};

						if (change.key === "auto_archive_duration" && change.new_value)
							return {
								name: `**Thread Auto Archive Duration:** ${this.client.functions.format(
									change.new_value * 1_000 * 60,
								)}`,
								order: 3,
							};

						if (change.key === "rate_limit_per_user" && change.new_value)
							return {
								name: `**Thread Slowmode:** ${this.client.functions.format(change.new_value * 1_000)}`,
								order: 4,
							};
						// @ts-expect-error
						if (change.key === "invitable" && change.new_value)
							return {
								name: "**Thread Invitable:** Yes",
								order: 5,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Thread Created",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditThreadCreate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Thread ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.success,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.ThreadUpdate) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "THREAD_UPDATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Thread Name:** ${change.old_value} -> ${change.new_value}`,
								order: 1,
							};

						if (change.key === "type")
							return {
								name: `**Thread Type:** ${this.channelTypesMap[change.old_value as ChannelType]} -> ${
									this.channelTypesMap[change.new_value as ChannelType]
								}`,
								order: 2,
							};

						if (change.key === "archived")
							return {
								name: `**Thread Archived:** ${change.old_value ? "Yes" : "No"} -> ${change.new_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "locked")
							return {
								name: `**Thread Locked:** ${change.old_value ? "Yes" : "No"} -> ${change.new_value ? "Yes" : "No"}`,
								order: 4,
							};

						if (change.key === "auto_archive_duration" && change.new_value)
							return {
								name: `**Thread Auto Archive Duration:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000 * 60) : "None"
								} -> ${change.new_value ? this.client.functions.format(change.new_value * 1_000 * 60) : "None"}`,
								order: 5,
							};

						if (change.key === "rate_limit_per_user" && change.new_value)
							return {
								name: `**Thread Slowmode:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000) : "None"
								} -> ${change.new_value ? this.client.functions.format(change.new_value * 1_000) : "None"}`,
								order: 6,
							};

						// @ts-expect-error
						if (change.key === "invitable")
							return {
								name: `**Thread Invitable:** ${
									// @ts-expect-error
									change.old_value ? "Yes" : "No"
									// @ts-expect-error
								} -> ${change.new_value ? "Yes" : "No"}`,
								order: 7,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Thread Updated",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditThreadUpdate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Thread ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.warning,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.ThreadDelete) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "THREAD_DELETED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "name")
							return {
								name: `**Thread Name:** ${change.old_value}`,
								order: 1,
							};

						if (change.key === "type")
							return {
								name: `**Thread Type:** ${this.channelTypesMap[change.old_value as ChannelType]}`,
								order: 2,
							};

						if (change.key === "archived")
							return {
								name: `**Thread Archived:** ${change.old_value ? "Yes" : "No"}`,
								order: 3,
							};

						if (change.key === "locked")
							return {
								name: `**Thread Locked:** ${change.old_value ? "Yes" : "No"}`,
								order: 4,
							};

						if (change.key === "auto_archive_duration" && change.new_value)
							return {
								name: `**Thread Auto Archive Duration:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000 * 60) : "None"
								}`,
								order: 5,
							};

						if (change.key === "rate_limit_per_user" && change.new_value)
							return {
								name: `**Thread Slowmode:** ${
									change.old_value ? this.client.functions.format(change.old_value * 1_000) : "None"
								}`,
								order: 6,
							};

						// @ts-expect-error
						if (change.key === "invitable")
							return {
								name: `**Thread Invitable:** ${
									// @ts-expect-error
									change.old_value ? "Yes" : "No"
								}`,
								order: 7,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Thread Deleted",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditThreadDelete.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								footer: {
									text: `Thread ID: ${auditLogEntry.target_id}`,
								},
								color: this.client.config.colors.error,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.InviteCreate) {
			const guildInvitesCache = this.client.invitesCache.get(auditLogEntry.guild_id) ?? new Map();
			guildInvitesCache.set(
				auditLogEntry.changes?.find((change) => change.key === "code"),
				0,
			);
			this.client.invitesCache.set(auditLogEntry.guild_id, guildInvitesCache);

			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "INVITE_CREATED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "channel_id")
							return {
								name: `**Channel:** <#${change.new_value}>`,
								order: 1,
							};

						if (change.key === "code")
							return {
								name: `**Code:** \`${change.new_value}\``,
								order: 2,
							};

						if (change.key === "max_uses" && change.new_value)
							return {
								name: `**Max Uses:** ${change.new_value}`,
								order: 3,
							};

						if (change.key === "max_age" && change.new_value)
							return {
								name: `**Expires:** ${this.client.functions.generateTimestamp({
									timestamp: Date.now() + (change.new_value ?? 0) * 1_000,
								})} (${this.client.functions.generateTimestamp({
									timestamp: Date.now() + (change.new_value ?? 0) * 1_000,
									type: "R",
								})})`,
								order: 4,
							};

						if (change.key === "temporary" && change.new_value)
							return {
								name: "**Temporary Membership:** Yes",
								order: 5,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Invite Created",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditLinkCreate.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								color: this.client.config.colors.success,
							},
						],
					}),
				),
			);
		}

		if (auditLogEntry.action_type === AuditLogEvent.InviteDelete) {
			const loggingChannels = await this.client.prisma.logChannel.findMany({
				where: {
					event: "INVITE_DELETED",
					guildId: auditLogEntry.guild_id!,
				},
			});

			if (!loggingChannels.length) return;

			const changes = (
				auditLogEntry.changes
					?.map((change) => {
						if (change.key === "channel_id")
							return {
								name: `**Channel:** <#${change.old_value}>`,
								order: 1,
							};

						if (change.key === "code")
							return {
								name: `**Code:** \`${change.old_value}\``,
								order: 2,
							};

						if (change.key === "max_uses" && change.old_value)
							return {
								name: `**Max Uses:** ${change.old_value}`,
								order: 3,
							};

						if (change.key === "max_age" && change.old_value)
							return {
								name: `**Expires:** ${this.client.functions.generateTimestamp({
									timestamp: Date.now() + (change.old_value ?? 0) * 1_000,
								})} (${this.client.functions.generateTimestamp({
									timestamp: Date.now() + (change.old_value ?? 0) * 1_000,
									type: "R",
								})})`,
								order: 4,
							};

						if (change.key === "temporary" && change.old_value)
							return {
								name: `**Temporary Membership:** ${change.old_value ? "Yes" : "No"}`,
								order: 5,
							};

						return null;
					})
					.filter(Boolean) as { name: string; order: number }[]
			)
				.sort((a, b) => a.order - b.order)
				.map((change) => change.name);

			if (!changes.length) return;

			return Promise.all(
				loggingChannels.map(async (loggingChannel) =>
					this.client.api.channels.createMessage(loggingChannel.channelId, {
						embeds: [
							{
								author: {
									name: "Invite Deleted",
									icon_url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/auditLinkDelete.png",
								},
								description: `**User:** ${
									auditLogEntry.user_id ? `<@${auditLogEntry.user_id}> \`[${auditLogEntry.user_id}]\`` : "Unknown User"
								}\n\n${changes.join("\n")}`,
								color: this.client.config.colors.error,
							},
						],
					}),
				),
			);
		}
	}
}
