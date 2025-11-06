import type { ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { LogEvent } from "@prisma/client";
import {
	type APIMessageTopLevelComponent,
	ChannelType,
	ComponentType,
	type GatewayThreadCreateDispatchData,
	MessageFlags,
} from "discord-api-types/v10";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";
import { getRunpodAccountLinkSection } from "../../utilities/components.js";
import { DISCORD_LOGIN_URL_QUERY, query, USER_BY_DISCORD_ID_QUERY } from "../../utilities/graphql.js";

export default class ThreadCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.ThreadCreate);
	}

	/**
	 * Sent when a thread is created, relevant to the current user, or when the current user is added to a thread. The inner payload is a channel object.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#thread-create
	 */
	public override async run({ data: channel }: ToEventProps<GatewayThreadCreateDispatchData>) {
		if (channel.type !== ChannelType.PublicThread) return;

		const parentChannel = await this.client.api.channels.get(channel.parent_id!);

		if (parentChannel.type !== ChannelType.GuildForum) return;

		const [autoTagOnForumChannel] = await Promise.all([
			this.client.prisma.autoTagOnForumChannel.findMany({
				where: {
					channelId: channel.parent_id!,
				},
			}),
			this.client.prisma.logChannel.findMany({
				where: {
					event: LogEvent.THREAD_CREATED,
					guildId: channel.guild_id!,
				},
			}),
		]);

		const tagIds = [...new Set((channel.applied_tags ?? []).concat(autoTagOnForumChannel.map(({ tagId }) => tagId)))];

		this.client.dataDog?.increment("forum_posts", 1, [
			`channelId:${parentChannel.id}`,
			`guildId:${channel.guild_id}`,
			`userId:${channel.owner_id}`,
			`parentChannelName:${parentChannel.name}`,
			...tagIds.map((tag) => `tagId:${tag}`),
		]);

		const currentTags = channel.applied_tags ?? [];
		const tagsChanged = tagIds.length !== currentTags.length || !tagIds.every((tag, i) => tag === currentTags[i]);

		if (tagsChanged) {
			this.client.logger.info(`Updating tags for thread ${channel.id}`);
			await this.client.api.channels.edit(channel.id, {
				applied_tags: tagIds,
			});
		}

		await Promise.all([
			this.client.prisma.channel.upsert({
				where: {
					id: channel.id,
				},
				update: {
					type: channel.type,
					name: channel.name,
					appliedTags: channel.applied_tags,
				},
				create: {
					id: channel.id,
					name: channel.name,
					type: channel.type,
					appliedTags: channel.applied_tags,
				},
			}),
			this.client.prisma.threadEvent.create({
				data: {
					threadId: channel.id,
					appliedTags: channel.applied_tags,
					timestamp: new Date(),
				},
			}),
		]);

		if (!channel.owner_id || !channel.newly_created) return;

		let isAuthenticated = this.client.authenticatedUsersCache.has(channel.owner_id);

		if (!isAuthenticated) {
			const userResponse = await query(USER_BY_DISCORD_ID_QUERY, {
				input: {
					discordId: channel.owner_id,
				},
			});

			if (userResponse.data?.userByDiscordId) {
				isAuthenticated = true;
				this.client.authenticatedUsersCache.add(channel.owner_id);
			}
		}

		const components: APIMessageTopLevelComponent[] = [
			{
				type: ComponentType.TextDisplay,
				content: "Thank you for contacting Runpod! A Runpod employee or a member of our community will help you soon.",
			},
		];

		if (!isAuthenticated) {
			const loginUrlResponse = await query(DISCORD_LOGIN_URL_QUERY);
			const loginUrl = loginUrlResponse.data?.discordLoginUrl;

			if (!loginUrl) return;

			const language = this.client.languageHandler.getLanguage("en-US");
			components.push(getRunpodAccountLinkSection(language, loginUrl));
		}

		await this.client.api.channels.createMessage(channel.id, {
			flags: MessageFlags.IsComponentsV2,
			components,
			allowed_mentions: { users: [channel.owner_id] },
		});
	}
}
