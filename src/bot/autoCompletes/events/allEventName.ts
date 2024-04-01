import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class AllEventName extends AutoComplete {
	/**
	 * Create our all event name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(
			[
				"events-delete-event",
				"events-edit-name-event",
				"events-edit-description-event",
				"events-edit-channel-event",
				"events-edit-status-event",
				"events-edit-codes_log_channel-event",
				"events-edit-code_amount-event",
				"events-top_submissions-event",
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

		const events = await this.client.prisma.event.findMany({
			where: {
				name: { startsWith: (value as string | undefined) ?? "", mode: "insensitive" },
				guildId: interaction.guild_id!,
			},
			take: 25,
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: events.map((event) => ({
				name: event.name,
				value: event.id,
			})),
		});
	}
}
