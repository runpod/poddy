import AutoComplete from "@lib/classes/AutoComplete.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "@lib/typings/index.js";
import type { APIApplicationCommandAutocompleteInteraction } from "discord-api-types/v10";

export default class InviteName extends AutoComplete {
	/**
	 * Create our invite name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["invites-info-name", "invites-delete-name"], client);
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

		const invites = await this.client.prisma.invite.findMany({
			where: {
				name: { startsWith: (value as string | undefined) ?? "", mode: "insensitive" },
				guildId: interaction.guild_id!,
			},
			take: 25,
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: invites.map((invite) => ({
				name: invite.name,
				value: invite.code,
			})),
		});
	}
}
