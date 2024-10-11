import { setTimeout } from "node:timers";
import type { APIApplicationCommandAutocompleteInteraction, APIGuildForumChannel } from "@discordjs/core";
import AutoComplete from "../../../../lib/classes/AutoComplete.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class AddTagsForForumChannel extends AutoComplete {
  /**
   * A cache for the tags of a channel, this has a TTL of thirty seconds.
   */
  private readonly cache = new Map<string, { id: string; name: string }[]>();

  /**
   * Create our add tags for forum channel autocomplete.
   *
   * @param client - Our extended client.
   */
  public constructor(client: ExtendedClient) {
    super(["config-auto_tag_on_forum_channel-add-tag"], client);
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
          "CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME",
        )
        // @ts-expect-error - This won't error.
      ]?.value;

    if (!channelId)
      return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
        choices: [],
      });

    const cached = this.cache.get(channelId);

    if (cached)
      return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
        choices: cached
          .filter((tag) =>
            tag.name
              .toLowerCase()
              .startsWith((interaction.arguments.focused?.value as string | undefined)?.toLowerCase() ?? ""),
          )
          .map((tag) => ({ name: tag.name, value: tag.id })),
      });

    const channel = (await this.client.api.channels.get(channelId)) as APIGuildForumChannel;
    this.cache.set(
      channelId,
      channel.available_tags.map((tag) => ({ id: tag.id, name: tag.name })),
    );

    setTimeout(() => this.cache.delete(channelId), 30_000);

    return this.client.api.interactions.createAutocompleteResponse(interaction.id, interaction.token, {
      choices: channel.available_tags
        .filter((tag) =>
          tag.name
            .toLowerCase()
            .startsWith((interaction.arguments.focused?.value as string | undefined)?.toLowerCase() ?? ""),
        )
        .map((tag) => ({ name: tag.name, value: tag.id })),
    });
  }
}
