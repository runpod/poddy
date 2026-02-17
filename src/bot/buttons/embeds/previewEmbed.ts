import { DiscordAPIError } from "@discordjs/rest";
import Button from "@lib/classes/Button.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { type APIMessageComponentButtonInteraction, MessageFlags, RESTJSONErrorCodes } from "discord-api-types/v10";

export default class PreviewEmbed extends Button {
	/**
	 * Create our preview embed button.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "previewEmbed",
		});
	}

	/**
	 * Run this button.
	 *
	 * @param options The options to run this button.
	 * @param options.interaction The interaction that triggered this button.
	 * @param options.language The language to use when replying to the interaction.
	 * @param options.shardId The shard ID to use when replying to the interaction.
	 */
	public override async run({
		interaction,
		language,
	}: {
		interaction: APIMessageComponentButtonInteraction;
		language: Language;
		shardId: number;
	}) {
		const [_, embedId] = interaction.data.custom_id.split(".");

		const embed = await this.client.prisma.embed.findUnique({ where: { id: embedId! } });

		if (!embed)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EMBED_NOT_FOUND_TITLE"),
						description: language.get("EMBED_NOT_FOUND_DESCRIPTION", {
							embedId,
						}),
						color: this.client.config.colors.error,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
				flags: MessageFlags.Ephemeral,
			});

		try {
			await this.client.api.interactions.reply(interaction.id, interaction.token, {
				...JSON.parse(embed.data.toString()),
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.RequestBodyContainsInvalidJSON)
				return this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("INVALID_JSON_TITLE"),
							description: language.get("INVALID_JSON_DESCRIPTION"),
							color: this.client.config.colors.error,
						},
					],
					allowed_mentions: { parse: [], replied_user: true },
					flags: MessageFlags.Ephemeral,
				});

			throw error;
		}
	}
}
