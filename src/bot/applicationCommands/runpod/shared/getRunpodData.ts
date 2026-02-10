import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { getAskLinkButtonRow } from "@src/utilities/components";
import { query, USER_BY_DISCORD_ID_QUERY, type UserByDiscordIdResult } from "@src/utilities/graphql.js";
import {
	type APIComponentInContainer,
	type APIContextMenuInteraction,
	type APIMessageTopLevelComponent,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from "discord-api-types/v10";

export async function getRunpodDiscordUser(
	client: ExtendedClient,
	interaction: APIContextMenuInteraction,
	targetUserId: string,
	language: Language,
) {
	try {
		const userResponse: UserByDiscordIdResult = await query(USER_BY_DISCORD_ID_QUERY, {
			input: {
				discordId: targetUserId,
			},
		});

		if (userResponse.errors) {
			client.logger.error(null, `GraphQL errors: ${userResponse.errors.map((e) => e.message).join(", ")}`);

			return client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("RUNPOD_FETCH_USER_FAILED"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const userData = userResponse.data?.userByDiscordId;

		if (!userData) {
			client.authenticatedUsersCache.delete(targetUserId);
			return client.api.interactions.reply(interaction.id, interaction.token, {
				components: [
					{
						type: ComponentType.TextDisplay,
						content: language.get("RUNPOD_NOT_LINKED"),
					},
					getAskLinkButtonRow(language, targetUserId),
				],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		client.authenticatedUsersCache.add(targetUserId);

		const components: APIMessageTopLevelComponent[] = [
			{
				type: ComponentType.Container,
				components: [
					{
						type: ComponentType.Section,
						components: [
							{
								type: ComponentType.TextDisplay,
								content: `### User ID\n\`${userData.id}\``,
							},
						],
						accessory: {
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: "View in Dashboard",
							url: `https://console.runpod.io/admin/users/${userData.id}`,
						},
					},
					{
						type: ComponentType.TextDisplay,
						content: `### Email\n\`${userData.email || "*Not available*"}\``,
					},
				],
			},
		];

		const visiblePods = userData.pods.filter((p) => p.desiredStatus !== "EXITED");
		if (visiblePods.length) {
			const podsComponents: APIComponentInContainer[] = [
				{
					type: ComponentType.TextDisplay,
					content: `### Pods\n${visiblePods.length} Pods`,
				},
			];

			for (const pod of visiblePods) {
				podsComponents.push({
					type: ComponentType.TextDisplay,
					content: `**${pod.id}**\nStatus: \`${pod.desiredStatus}\``,
				}); // this would be a section with a button but we cant link to pod pages
			}

			components.push({
				type: ComponentType.Container,
				components: podsComponents,
			});
		}

		if (userData.endpoints.length) {
			const endpointsComponents: APIComponentInContainer[] = [
				{
					type: ComponentType.TextDisplay,
					content: `### Endpoints\n${userData.endpoints.length} Endpoints`,
				},
			];

			for (const endpoint of userData.endpoints) {
				endpointsComponents.push({
					type: ComponentType.Section,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `**${endpoint.id}**`,
						},
					],
					accessory: {
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						label: "View Endpoint",
						url: `https://console.runpod.io/admin/users/${userData.id}/endpoints/${endpoint.id}`,
					},
				});
			}

			components.push({
				type: ComponentType.Container,
				components: endpointsComponents,
			});
		}

		return client.api.interactions.reply(interaction.id, interaction.token, {
			components,
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
		});
	} catch (error) {
		client.logger.error(error, "Failed to fetch user data");

		return client.api.interactions.reply(interaction.id, interaction.token, {
			content: language.get("RUNPOD_FETCH_USER_FAILED"),
			flags: MessageFlags.Ephemeral,
		});
	}
}
