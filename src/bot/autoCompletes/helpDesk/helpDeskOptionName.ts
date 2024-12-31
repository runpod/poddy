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
				"help_desk_options-response-option",
				"help_desk_options-description-set-option",
				"help_desk_options-description-reset-option",
				"help_desk_options-emoji-set-option",
				"help_desk_options-emoji-reset-option",
				"help_desk_options-position-option",
				"help_desk_options-rename-option",
				"help_desk_options-remove-option",
				"help_desk_options-roles-add-option",
				"help_desk_options-roles-remove-option",
				"help_desk_options-roles-list-option",
				"help_desk_options_modal-title-set-option",
				"help_desk_options_modal-title-reset-option",
				"help_desk_options_modal-components-add-option",
				"help_desk_options_modal-components-delete-option",
				"help_desk_options_modal-channel-set-option",
				"help_desk_options_modal-channel-reset-option",
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
		const helpDeskId =
			interaction.arguments.strings?.[this.client.languageHandler.defaultLanguage!.get("HELP_DESK_COMMAND_NAME")]
				?.value;

		const helpDesk = await this.client.prisma.helpDesk.findUnique({
			where: { id: helpDeskId ?? "", guildId: interaction.guild_id! },
			include: {
				helpDeskOptions: {
					where: { name: { startsWith: (value as string | undefined) ?? "", mode: "insensitive" } },
					take: 25,
				},
			},
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices:
				helpDesk?.helpDeskOptions.map((helpDeskOption) => ({
					name: helpDeskOption.name,
					value: helpDeskOption.id,
				})) ?? [],
		});
	}
}
