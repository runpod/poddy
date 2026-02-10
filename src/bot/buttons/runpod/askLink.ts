import { type APIMessageComponentButtonInteraction, ComponentType, MessageFlags } from "@discordjs/core";
import Button from "@lib/classes/Button.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { getRunpodAccountLinkSection } from "@src/utilities/components";
import { DISCORD_LOGIN_URL_QUERY, query } from "@src/utilities/graphql";
import type { APIActionRowComponent, APIButtonComponent, APIMessageTopLevelComponent } from "discord-api-types/v10";

export default class AskLink extends Button {
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "askLink",
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIMessageComponentButtonInteraction;
		language: Language;
		shardId: number;
	}) {
		const [, targetUserId] = interaction.data.custom_id.split(".") as [string, string];

		const loginUrlResponse = await query(DISCORD_LOGIN_URL_QUERY);
		const loginUrl = loginUrlResponse.data?.discordLoginUrl;

		if (!loginUrl) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: language.get("RUNPOD_FETCH_LINK_FAILED"),
				flags: MessageFlags.Ephemeral,
			});
		}

		await this.client.api.channels.createMessage(interaction.channel.id!, {
			flags: MessageFlags.IsComponentsV2,
			components: [
				{ type: ComponentType.TextDisplay, content: `<@${targetUserId}>` },
				getRunpodAccountLinkSection(language, loginUrl),
			],
			allowed_mentions: { users: [targetUserId] },
		});

		const components = interaction.message.components!;
		(components[1]! as APIActionRowComponent<APIButtonComponent>).components[0]!.disabled = true;

		return this.client.api.interactions.updateMessage(interaction.id, interaction.token, {
			components: components as APIMessageTopLevelComponent[],
		});
	}
}
