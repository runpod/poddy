import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDeskOptionModalComponentName extends AutoComplete {
	/**
	 * Create our help desk option modal component name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["help_desk_options_modal-components-delete-component"], client);
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
		const helpDeskOptionId =
			interaction.arguments.strings?.[
				this.client.languageHandler.defaultLanguage!.get(
					"HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_OPTION_OPTION_NAME",
				)
			]?.value;

		const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
			where: { id: helpDeskOptionId ?? "", helpDeskId: helpDeskId ?? "" },
			include: {
				helpDeskOptionModalComponents: {
					where: {
						label: { startsWith: (value as string | undefined) ?? "", mode: "insensitive" },
					},
					take: 25,
				},
			},
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices:
				helpDeskOption?.helpDeskOptionModalComponents.map((helpDeskOptionModalComponent) => ({
					name: helpDeskOptionModalComponent.label,
					value: helpDeskOptionModalComponent.id,
				})) ?? [],
		});
	}
}
