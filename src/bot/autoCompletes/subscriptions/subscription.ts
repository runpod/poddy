import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDeskName extends AutoComplete {
	/**
	 * A cache of channel ID to channel name, this has a TTL of 5 minutes.
	 */
	private readonly cache = new Map<string, string>();

	/**
	 * Create our help desk name auto complete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["subscriptions-unsubscribe-group"], client);
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
		const userId =
			interaction.arguments.users![
				this.client.languageHandler.defaultLanguage!.get("SUBSCRIPTIONS_COMMAND_SUBSCRIBE_SUB_COMMAND_USER_OPTION_NAME")
				// @ts-expect-error - This won't actually error, the type is just weird.
			]!.value;

		const userSubscriptions = await this.client.prisma.subscribedUser.findMany({
			where: {
				userId,
			},
			include: { group: true },
			take: 25,
		});

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: await Promise.all(
				userSubscriptions.map(async (userSubscription) => {
					if (!this.cache.has(userSubscription.channelId)) {
						const fetchedChannel = await this.client.api.channels.get(userSubscription.channelId);

						this.cache.set(userSubscription.channelId, fetchedChannel.name ?? "");
					}

					const channelName = this.cache.get(userSubscription.channelId);

					return {
						name: `${userSubscription.group.name} in #${channelName}`,
						value: userSubscription.id,
					};
				}),
			),
		});
	}
}
