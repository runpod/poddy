import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDeskName extends AutoComplete {
	/**
	 * Create our help desk name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(
			[
				"help_desk-embed_color-set-name",
				"help_desk-embed_color-reset-name",
				"help_desk-channel-set-name",
				"help_desk-channel-reset-name",
				"help_desk-delete-name",
				"help_desk-rename-name",
				"help_desk_options-add-help_desk",
				"help_desk_options-response-help_desk",
				"help_desk_options-description-set-help_desk",
				"help_desk_options-description-reset-help_desk",
				"help_desk_options-emoji-set-help_desk",
				"help_desk_options-emoji-reset-help_desk",
				"help_desk_options-position-help_desk",
				"help_desk_options-remove-help_desk",
				"help_desk_options-rename-help_desk",
			],
			client,
		);
	}

	/**
	 * Run this auto complete.
	 *
	 * @param options - The options for this auto complete.
	 * @param options.shardId - The shard ID that this interaction was received on.
	 * @param options.language - The language to use when replying to the interaction.
	 * @param options.interaction - The interaction to run this auto complete on.
	 */
	public override async run({
		interaction,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandAutocompleteInteraction>;
		language: Language;
		shardId: number;
	}) {
		const value = interaction.arguments.focused?.value;

		const helpDesks = await this.client.prisma.helpDesk.findMany({
			where: {
				name: { startsWith: (value as string | undefined) ?? "", mode: "insensitive" },
				guildId: interaction.guild_id!,
			},
			take: 25,
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: helpDesks.map((helpDesk) => ({
				name: helpDesk.name,
				value: helpDesk.id,
			})),
		});
	}
}
