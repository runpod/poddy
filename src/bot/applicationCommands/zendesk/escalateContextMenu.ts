import type { APIMessageApplicationCommandInteraction, APIThreadChannel } from "@discordjs/core";
import {
  ApplicationCommandType,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
  PermissionFlagsBits,
} from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class EscalateContextMenu extends ApplicationCommand {
  /**
   * Create our escalate context menu.
   *
   * @param client - Our extended client.
   */
  public constructor(client: ExtendedClient) {
    super(client, {
      options: {
        ...client.languageHandler.generateLocalizationsForApplicationCommandOptionTypeStringWithChoices({
          name: "ESCALATE_TO_ZENDESK_TITLE",
        }),
        default_member_permissions: PermissionFlagsBits.ManageMessages.toString(),
        type: ApplicationCommandType.Message,
        dm_permission: false,
      },
    });
  }

  /**
   * Run this application command.
   *
   * @param options - The options for this command.
   * @param options.shardId - The shard ID that this interaction was received on.
   * @param options.language - The language to use when replying to the interaction.
   * @param options.interaction -  The interaction to run this command on.
   */
  public override async run({
    interaction,
    language,
  }: {
    interaction: APIInteractionWithArguments<APIMessageApplicationCommandInteraction>;
    language: Language;
    shardId: number;
  }) {
    const message = interaction.data.resolved.messages[interaction.data.target_id];

    if (!message)
      return this.client.api.interactions.reply(interaction.id, interaction.token, {
        embeds: [
          {
            title: language.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
            description: language.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
            color: this.client.config.colors.error,
          },
        ],
        allowed_mentions: { parse: [], replied_user: true },
        flags: MessageFlags.Ephemeral,
      });

    const channel = await this.client.api.channels.get(message.channel_id);

    if (channel.type !== ChannelType.PublicThread)
      return this.client.api.interactions.reply(interaction.id, interaction.token, {
        content: `<@${message.author.id}>`,
        embeds: [
          {
            title: language.get("ESCALATED_TO_ZENDESK_TITLE"),
            description: language.get("ESCALATED_MESSAGE_TO_ZENDESK_DESCRIPTION"),
            color: this.client.config.colors.success,
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                custom_id: `escalateToZendesk.message.${message.id}.${interaction.member!.user.id}.${
                  message.author.id
                }`,
                label: language.get("OPEN_ZENDESK_TICKET_BUTTON_LABEL"),
              },
            ],
          },
        ],
        allowed_mentions: { parse: [], users: [message.author.id] },
      });

    const thread = channel as APIThreadChannel;

    return this.client.api.interactions.reply(interaction.id, interaction.token, {
      content: `<@${thread.owner_id}>`,
      embeds: [
        {
          title: language.get("ESCALATED_TO_ZENDESK_TITLE"),
          description: language.get("ESCALATED_THREAD_TO_ZENDESK_DESCRIPTION"),
          color: this.client.config.colors.success,
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Success,
              custom_id: `escalateToZendesk.thread.${thread.id}.${interaction.member!.user.id}.${thread.owner_id}`,
              label: language.get("OPEN_ZENDESK_TICKET_BUTTON_LABEL"),
            },
          ],
        },
      ],
      allowed_mentions: { parse: [], users: thread.owner_id ? [thread.owner_id] : [] },
    });
  }
}
