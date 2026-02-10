import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "@lib/classes/AutoComplete.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "@lib/typings/index.js";

export default class EmbedName extends AutoComplete {
	/**
	 * Create our embed name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["embed-delete-name", "embed-preview-name", "embed-rename-name"], client);
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

		const embeds = await this.client.prisma.embed.findMany({
			where: { name: { startsWith: ((value as string | undefined) ?? "").toLowerCase() } },
			take: 25,
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: embeds.map((embed) => ({
				name: embed.name,
				value: embed.id,
			})),
		});
	}
}
