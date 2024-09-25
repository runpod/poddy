import type { APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import { LogEvent } from "@prisma/client";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class AddTagsForForumChannel extends AutoComplete {
	/**
	 * The event names that can be logged.
	 */
	private readonly eventNames = Object.keys(LogEvent) as (keyof typeof LogEvent)[];

	/**
	 * Create our log channel add event name autocomplete.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(["config-log_channels-add-event"], client);
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
		const channelId =
			interaction.arguments.channels?.[
				this.client.languageHandler.defaultLanguage!.get(
					"CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
				)
				// @ts-expect-error - This won't error.
			]?.value;

		if (!channelId)
			return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
				choices: [],
			});

		const alreadyLoggedEvents = await this.client.prisma.logChannel.findMany({ where: { channelId } });
		const alreadyLoggedEventNames: (keyof typeof LogEvent)[] = alreadyLoggedEvents.map((event) => event.event);

		return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
			choices: this.eventNames
				.filter((eventName) => !alreadyLoggedEventNames.includes(eventName))
				.map((eventName) => ({
					name: eventName
						.split("_")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
						.join(" "),
					value: eventName,
				}))
				.filter(({ name }) =>
					name
						.toLowerCase()
						.startsWith((interaction.arguments.focused?.value as string | undefined)?.toLowerCase() ?? ""),
				),
		});
	}
}
