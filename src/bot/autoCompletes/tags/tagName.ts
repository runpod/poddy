import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class TagName extends AutoComplete {
	/**
	 * Create our tag name autocomplete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["tag-name", "tags-delete-name", "tags-edit-name"], client);
	}

	/**
	 * Run this autocomplete.
	 *
	 * @param options - The options for this autocomplete.
	 * @param options.shardId - The shard ID that this interaction was received on.
	 * @param options.language - The language to use when replying to the interaction.
	 * @param options.interaction - The interaction to run this autocomplete on.
	 */
	public override async run({
		interaction,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandAutocompleteInteraction>;
		language: Language;
		shardId: number;
	}) {
		const value = interaction.arguments.focused?.value;
		const query = (value as string | undefined) ?? "";

		const tags = await this.client.prisma.tag.findMany({
			where: {
				OR: [
					{
						id: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						name: {
							contains: query,
							mode: "insensitive",
						},
					},
				],
			},
			take: 25,
			orderBy: {
				name: "asc",
			},
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: tags.map((tag) => ({
				name: tag.name,
				value: tag.id,
			})),
		});
	}
}
