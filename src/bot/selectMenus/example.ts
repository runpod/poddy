import type Language from "@lib/classes/Language.js";
import SelectMenu from "@lib/classes/SelectMenu.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { type APIMessageComponentSelectMenuInteraction, MessageFlags } from "discord-api-types/v10";

export default class ExampleSelectMenu extends SelectMenu {
	/**
	 * Create our example select menu.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "example",
		});
	}

	/**
	 * Run this select menu.
	 *
	 * @param options The options to run this select menu.
	 * @param options.interaction The interaction to run this select menu.
	 * @param options.language The language to use when replying to the interaction.
	 * @param options.shardId The shard ID to use when replying to the interaction.
	 */
	public override async run({
		interaction,
	}: {
		interaction: APIMessageComponentSelectMenuInteraction;
		language: Language;
		shardId: number;
	}) {
		// Handler matches via customId.startsWith(name), so "example.abc123" routes here
		const [, extraId] = interaction.data.custom_id.split(".");

		const selectedValues = interaction.data.values;

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			content: `Selected: ${selectedValues.join(", ")}${extraId ? ` (id: ${extraId})` : ""}`,
			flags: MessageFlags.Ephemeral,
		});
	}
}
