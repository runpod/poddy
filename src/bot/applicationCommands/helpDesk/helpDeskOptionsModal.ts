import type { APIApplicationCommandInteraction } from "@discordjs/core";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from "@discordjs/core";
import { TextInputStyle } from "@prisma/client";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class HelpDeskOptionsModal extends ApplicationCommand {
  /**
   * Create our help desk options modal command.
   *
   * @param client - Our extended client.
   */
  public constructor(client: ExtendedClient) {
    super(client, {
      options: {
        ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
          name: "HELP_DESK_OPTIONS_MODAL_COMMAND_NAME",
          description: "HELP_DESK_OPTIONS_MODAL_COMMAND_DESCRIPTION",
        }),
        options: [
          {
            ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
              name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_NAME",
              description: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_DESCRIPTION",
            }),
            options: [
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_TITLE_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_TITLE_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
            ],
            type: ApplicationCommandOptionType.SubcommandGroup,
          },
          {
            ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
              name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_NAME",
              description: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DESCRIPTION",
            }),
            options: [
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_LABEL_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_LABEL_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_STYLE_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_STYLE_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                      {
                        ...client.languageHandler.generateLocalizationsForApplicationCommandOptionTypeStringWithChoices(
                          {
                            name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_STYLE_OPTION_SHORT_OPTION_CHOICE",
                          },
                        ),
                        value: "short",
                      },
                      {
                        ...client.languageHandler.generateLocalizationsForApplicationCommandOptionTypeStringWithChoices(
                          {
                            name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_STYLE_OPTION_LONG_OPTION_CHOICE",
                          },
                        ),
                        value: "long",
                      },
                    ],
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_REQUIRED_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_REQUIRED_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.Boolean,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_VALUE_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_VALUE_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_PLACEHOLDER_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_PLACEHOLDER_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MIN_LENGTH_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MIN_LENGTH_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.Integer,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MAX_LENGTH_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MAX_LENGTH_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.Integer,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_POSITION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.Integer,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_COMPONENT_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_COMPONENT_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
            ],
            type: ApplicationCommandOptionType.SubcommandGroup,
          },
          {
            ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
              name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_NAME",
              description: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_DESCRIPTION",
            }),
            options: [
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_CHANNEL_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildText],
                    required: true,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
              {
                ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                  name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_NAME",
                  description: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_DESCRIPTION",
                }),
                options: [
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_HELP_DESK_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                  {
                    ...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
                      name: "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_NAME",
                      description:
                        "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_RESET_SUB_COMMAND_OPTION_OPTION_DESCRIPTION",
                    }),
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                  },
                ],
                type: ApplicationCommandOptionType.Subcommand,
              },
            ],
            type: ApplicationCommandOptionType.SubcommandGroup,
          },
        ],
        default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
        type: ApplicationCommandType.ChatInput,
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
    interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
    language: Language;
    shardId: number;
  }) {
    const helpDeskNameOrId =
      interaction.arguments.strings![
        this.client.languageHandler.defaultLanguage!.get(
          "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_HELP_DESK_OPTION_NAME",
        )
      ]!.value;

    const helpDesk = await this.client.prisma.helpDesk.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: helpDeskNameOrId,
              mode: "insensitive",
            },
          },
          {
            id: helpDeskNameOrId,
          },
        ],
        guildId: interaction.guild_id!,
      },
    });

    if (!helpDesk)
      return this.client.api.interactions.reply(interaction.id, interaction.token, {
        embeds: [
          {
            title: language.get("HELP_DESK_NOT_FOUND_TITLE"),
            description: language.get("HELP_DESK_NOT_FOUND_DESCRIPTION", {
              helpDeskId: helpDeskNameOrId,
            }),
            color: this.client.config.colors.error,
          },
        ],
        allowed_mentions: { parse: [], replied_user: true },
        flags: MessageFlags.Ephemeral,
      });

    const helpDeskOptionIdOrName =
      interaction.arguments.strings![
        this.client.languageHandler.defaultLanguage!.get(
          "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_OPTION_OPTION_NAME",
        )
      ]!.value;

    const helpDeskOption = await this.client.prisma.helpDeskOption.findFirst({
      where: {
        OR: [
          {
            id: helpDeskOptionIdOrName,
          },
          {
            name: {
              equals: helpDeskOptionIdOrName,
              mode: "insensitive",
            },
          },
        ],
        helpDeskId: helpDesk.id,
      },
    });

    if (!helpDeskOption)
      return this.client.api.interactions.reply(interaction.id, interaction.token, {
        embeds: [
          {
            title: language.get("HELP_DESK_OPTION_NOT_FOUND_TITLE"),
            description: language.get("HELP_DESK_OPTION_NOT_FOUND_DESCRIPTION", {
              helpDeskId: helpDesk.id,
              helpDeskName: helpDesk.name,
              optionId: helpDeskOptionIdOrName,
            }),
            color: this.client.config.colors.error,
          },
        ],
        allowed_mentions: { parse: [], replied_user: true },
        flags: MessageFlags.Ephemeral,
      });

    if (
      interaction.arguments.subCommandGroup?.name ===
      this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_NAME")
    ) {
      if (
        interaction.arguments.subCommand?.name ===
        this.client!.languageHandler.defaultLanguage!.get(
          "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
        )
      ) {
        const title =
          interaction.arguments.strings![
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_TITLE_SUB_COMMAND_GROUP_SET_SUB_COMMAND_TITLE_OPTION_NAME",
            )
          ]!.value;

        return Promise.all([
          this.client.prisma.helpDeskOption.update({
            where: {
              id: helpDeskOption.id,
            },
            data: {
              modalTitle: title,
            },
          }),
          this.client.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [
              {
                title: language.get("HELP_DESK_MODAL_TITLE_SET_TITLE"),
                description: language.get("HELP_DESK_MODAL_TITLE_SET_DESCRIPTION", {
                  helpDeskName: helpDesk.name,
                  helpDeskId: helpDesk.id,
                  title,
                }),
                color: this.client.config.colors.success,
              },
            ],
            allowed_mentions: { parse: [], replied_user: true },
          }),
        ]);
      }

      return Promise.all([
        this.client.prisma.helpDeskOption.update({
          where: {
            id: helpDeskOption.id,
          },
          data: {
            modalTitle: null,
          },
        }),
        this.client.api.interactions.reply(interaction.id, interaction.token, {
          embeds: [
            {
              title: language.get("HELP_DESK_MODAL_TITLE_RESET_TITLE"),
              description: language.get("HELP_DESK_MODAL_TITLE_RESET_DESCRIPTION", {
                helpDeskName: helpDesk.name,
                helpDeskId: helpDesk.id,
              }),
              color: this.client.config.colors.success,
            },
          ],
          allowed_mentions: { parse: [], replied_user: true },
        }),
      ]);
    } else if (
      interaction.arguments.subCommandGroup?.name ===
      this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_NAME")
    ) {
      if (
        interaction.arguments.subCommand?.name ===
        this.client.languageHandler.defaultLanguage!.get(
          "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME",
        )
      ) {
        const componentCount = await this.client.prisma.helpDeskOptionModalComponent.count({
          where: {
            helpDeskOptionId: helpDeskOption.id,
          },
        });

        if (componentCount >= 5)
          return this.client.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [
              {
                title: language.get("HELP_DESK_MODAL_COMPONENT_LIMIT_REACHED_TITLE"),
                description: language.get("HELP_DESK_MODAL_COMPONENT_LIMIT_REACHED_DESCRIPTION"),
                color: this.client.config.colors.error,
              },
            ],
            flags: MessageFlags.Ephemeral,
            allowed_mentions: { parse: [], replied_user: true },
          });

        const label =
          interaction.arguments.strings![
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_LABEL_OPTION_NAME",
            )
          ]!.value;
        const style = interaction.arguments.strings![
          this.client.languageHandler.defaultLanguage!.get(
            "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_STYLE_OPTION_NAME",
          )
        ]!.value as "long" | "short";

        const required =
          interaction.arguments.booleans?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_REQUIRED_OPTION_NAME",
            )
          ]?.value ?? false;
        const value =
          interaction.arguments.strings?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_VALUE_OPTION_NAME",
            )
          ]?.value ?? null;
        const placeholder =
          interaction.arguments.strings?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_PLACEHOLDER_OPTION_NAME",
            )
          ]?.value ?? null;
        const minLength =
          interaction.arguments.integers?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MIN_LENGTH_OPTION_NAME",
            )
          ]?.value ?? null;
        const maxLength =
          interaction.arguments.integers?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_MAX_LENGTH_OPTION_NAME",
            )
          ]?.value ?? null;
        let position =
          interaction.arguments.integers?.[
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_POSITION_OPTION_NAME",
            )
          ]?.value;

        if (!position) position = componentCount + 1;

        return Promise.all([
          await this.client.prisma.helpDeskOptionModalComponent.create({
            data: {
              helpDeskOptionId: helpDeskOption.id,
              label,
              style: style === "long" ? TextInputStyle.PARAGRAPH : TextInputStyle.SHORT,
              required,
              value,
              placeholder,
              minLength,
              maxLength,
              position,
            },
          }),
          this.client.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [
              {
                title: language.get("HELP_DESK_MODAL_COMPONENT_ADDED_TITLE"),
                description: language.get("HELP_DESK_MODAL_COMPONENT_ADDED_DESCRIPTION", {
                  helpDeskName: helpDesk.name,
                  helpDeskId: helpDesk.id,
                }),
                color: this.client.config.colors.success,
              },
            ],
            allowed_mentions: { parse: [], replied_user: true },
          }),
        ]);
      }

      const componentIdOrLabel =
        interaction.arguments.strings![
          this.client.languageHandler.defaultLanguage!.get(
            "HELP_DESK_OPTIONS_MODAL_COMPONENTS_SUB_COMMAND_GROUP_DELETE_SUB_COMMAND_COMPONENT_OPTION_NAME",
          )
        ]!.value;

      const component = await this.client.prisma.helpDeskOptionModalComponent.findFirst({
        where: {
          OR: [
            {
              id: componentIdOrLabel,
            },
            {
              label: { mode: "insensitive", equals: componentIdOrLabel },
            },
          ],
          helpDeskOptionId: helpDeskOption.id,
        },
      });

      if (!component)
        return this.client.api.interactions.reply(interaction.id, interaction.token, {
          embeds: [
            {
              title: language.get("HELP_DESK_MODAL_COMPONENT_NOT_FOUND_TITLE"),
              description: language.get("HELP_DESK_MODAL_COMPONENT_NOT_FOUND_DESCRIPTION", {
                componentId: componentIdOrLabel,
              }),
              color: this.client.config.colors.error,
            },
          ],
          allowed_mentions: { parse: [], replied_user: true },
          flags: MessageFlags.Ephemeral,
        });

      return Promise.all([
        this.client.prisma.helpDeskOptionModalComponent.delete({ where: { id: component.id } }),
        this.client.api.interactions.reply(interaction.id, interaction.token, {
          embeds: [
            {
              title: language.get("HELP_DESK_MODAL_COMPONENT_DELETED_TITLE"),
              description: language.get("HELP_DESK_MODAL_COMPONENT_DELETED_DESCRIPTION", {
                helpDeskName: helpDesk.name,
                helpDeskId: helpDesk.id,
              }),
              color: this.client.config.colors.success,
            },
          ],
        }),
      ]);
    } else if (
      interaction.arguments.subCommandGroup?.name ===
      this.client.languageHandler.defaultLanguage!.get("HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_NAME")
    ) {
      if (
        interaction.arguments.subCommand?.name ===
        this.client.languageHandler.defaultLanguage!.get(
          "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_NAME",
        )
      ) {
        const channelId =
          interaction.arguments.channels![
            this.client.languageHandler.defaultLanguage!.get(
              "HELP_DESK_OPTIONS_MODAL_CHANNEL_SUB_COMMAND_GROUP_SET_SUB_COMMAND_CHANNEL_OPTION_NAME",
            )
          ]!.id;

        return Promise.all([
          this.client.prisma.helpDeskOption.update({
            where: {
              id: helpDeskOption.id,
            },
            data: {
              channelId,
            },
          }),
          this.client.api.interactions.reply(interaction.id, interaction.token, {
            embeds: [
              {
                title: language.get("HELP_DESK_OPTIONS_MODAL_CHANNEL_SET_TITLE"),
                description: language.get("HELP_DESK_OPTIONS_MODAL_CHANNEL_SET_DESCRIPTION", {
                  helpDeskName: helpDesk.name,
                  helpDeskId: helpDesk.id,
                  channel: `<#${channelId}>`,
                }),
                color: this.client.config.colors.success,
              },
            ],
            allowed_mentions: { parse: [], replied_user: true },
          }),
        ]);
      }

      return Promise.all([
        this.client.prisma.helpDeskOption.update({
          where: {
            id: helpDeskOption.id,
          },
          data: {
            channelId: null,
          },
        }),
        this.client.api.interactions.reply(interaction.id, interaction.token, {
          embeds: [
            {
              title: language.get("HELP_DESK_OPTIONS_MODAL_CHANNEL_RESET_TITLE"),
              description: language.get("HELP_DESK_OPTIONS_MODAL_CHANNEL_RESET_DESCRIPTION", {
                helpDeskName: helpDesk.name,
                helpDeskId: helpDesk.id,
              }),
              color: this.client.config.colors.success,
            },
          ],
        }),
      ]);
    }
  }
}
