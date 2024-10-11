import type { APIMessageComponentSelectMenuInteraction, APITextInputComponent } from "@discordjs/core";
import { ComponentType, MessageFlags, TextInputStyle } from "@discordjs/core";
import type Language from "../../../../lib/classes/Language.js";
import SelectMenu from "../../../../lib/classes/SelectMenu.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";

export default class HelpDesk extends SelectMenu {
  /**
   * Create our help desk select menu.
   *
   * @param client - Our extended client.
   */
  public constructor(client: ExtendedClient) {
    super(client, {
      name: "helpDesk",
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
    const helpDeskOptionId = interaction.data.values[0]!;

    const helpDeskOption = await this.client.prisma.helpDeskOption.findUnique({
      where: {
        id: helpDeskOptionId,
      },
      include: {
        response: true,
        helpDeskOptionModalComponents: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!helpDeskOption) {
      this.client.logger.warn(`Help desk option with ID ${helpDeskOptionId} was not found.`);

      return;
    }

    if (helpDeskOption.modalTitle && helpDeskOption.channelId && helpDeskOption.helpDeskOptionModalComponents.length)
      return this.client.api.interactions.createModal(interaction.id, interaction.token, {
        custom_id: `helpDeskOptionsModal.${helpDeskOption.id}`,
        title: helpDeskOption.modalTitle,
        components: helpDeskOption.helpDeskOptionModalComponents.map((helpDeskOptionModalComponent) => {
          const component: APITextInputComponent = {
            type: ComponentType.TextInput,
            custom_id: helpDeskOptionModalComponent.id,
            label: helpDeskOptionModalComponent.label,
            style: helpDeskOptionModalComponent.style === "PARAGRAPH" ? TextInputStyle.Paragraph : TextInputStyle.Short,
          };

          if (helpDeskOptionModalComponent.required) component.required = true;
          if (helpDeskOptionModalComponent.minLength) component.min_length = helpDeskOptionModalComponent.minLength;
          if (helpDeskOptionModalComponent.maxLength) component.max_length = helpDeskOptionModalComponent.maxLength;
          if (helpDeskOptionModalComponent.value) component.value = helpDeskOptionModalComponent.value;
          else if (helpDeskOptionModalComponent.placeholder)
            component.placeholder = helpDeskOptionModalComponent.placeholder;

          return { type: ComponentType.ActionRow, components: [component] };
        }),
      });

    if (helpDeskOption.roleIds.length)
      await this.client.api.guilds.editMember(interaction.guild_id!, interaction.member!.user.id, {
        roles: [...new Set(interaction.member!.roles.concat(helpDeskOption.roleIds))],
      });

    return this.client.api.interactions.reply(interaction.id, interaction.token, {
      ...JSON.parse(helpDeskOption.response.data),
      allowed_mentions: { parse: [], replied_user: true },
      flags: MessageFlags.Ephemeral,
    });
  }
}
