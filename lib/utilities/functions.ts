/* eslint-disable n/no-sync */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { env } from "node:process";
import type { APIMessage, APISelectMenuOption, RESTPostAPIChannelMessageJSONBody } from "@discordjs/core";
import { ComponentType, RESTJSONErrorCodes } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import Config from "../../config/bot.config.js";
import type { BetterStackStatusReport, BetterStackStatusUpdate } from "../../typings/index.js";
import type Language from "../classes/Language.js";
import Logger from "../classes/Logger.js";
import type ExtendedClient from "../extensions/ExtendedClient.js";

export default class Functions {
  /**
   * Our extended client.
   */
  private readonly client: ExtendedClient;

  /**
   * One second in milliseconds.
   */
  private SEC = 1e3;

  /**
   * One minute in milliseconds.
   */
  private MIN = this.SEC * 60;

  /**
   * One hour in milliseconds.
   */
  private HOUR = this.MIN * 60;

  /**
   * One day in milliseconds.
   */
  private DAY = this.HOUR * 24;

  /**
   * One year in milliseconds.
   */
  private YEAR = this.DAY * 365.25;

  public constructor(client: ExtendedClient) {
    this.client = client;
  }

  /**
   * Get all of the files in a directory.
   *
   * @param directory The directory to get all of the files from.
   * @param fileExtension The file extension to search for, leave blank to get all files.
   * @param createDirectoryIfNotFound Whether or not the directory we want to search for should be created if it doesn't already exist.
   * @returns The files within the directory.
   */
  public getFiles(directory: string, fileExtension: string, createDirectoryIfNotFound: boolean = false) {
    if (createDirectoryIfNotFound && !existsSync(directory)) mkdirSync(directory);

    return readdirSync(directory).filter((file) => file.endsWith(fileExtension));
  }

  /**
   * Parses the input string, returning the number of milliseconds.
   *
   * @param input The human-readable time string; eg: 10min, 10m, 10 minutes.
   * @param language The language to use for the parsing.
   * @returns The parsed value.
   */
  public parse(input: string, language?: Language) {
    if (!language) language = this.client.languageHandler.getLanguage("en-US");

    const RGX =
      // eslint-disable-next-line unicorn/no-unsafe-regex, prefer-named-capture-group
      /^(-?(?:\d+)?\.?\d+) *(m(?:illiseconds?|s(?:ecs?)?))?(s(?:ec(?:onds?|s)?)?)?(m(?:in(?:utes?|s)?)?)?(h(?:ours?|rs?)?)?(d(?:ays?)?)?(w(?:eeks?|ks?)?)?(y(?:ears?|rs?)?)?$/;
    // language.get("PARSE_REGEX");

    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const arr = input.toLowerCase().match(RGX);
    let num: number;
    // eslint-disable-next-line no-cond-assign
    if (arr !== null && (num = Number.parseFloat(arr[1] || ""))) {
      if (arr[3] !== null) return num * this.SEC;
      if (arr[4] !== null) return num * this.MIN;
      if (arr[5] !== null) return num * this.HOUR;
      if (arr[6] !== null) return num * this.DAY;
      if (arr[7] !== null) return num * this.DAY * 7;
      if (arr[8] !== null) return num * this.YEAR;
      return num;
    }

    return null;
  }

  private _format(
    value: number,
    prefix: string,
    type: "day" | "hour" | "minute" | "ms" | "second" | "year",
    long: boolean,
    language: Language,
  ) {
    const number = Math.trunc(value) === value ? value : Math.trunc(value + 0.5);

    if (type === "ms") return `${prefix}${number}ms`;

    return `${prefix}${number}${
      long
        ? ` ${language.get(
            (number === 1 ? `${type}_ONE` : `${type}_OTHER`).toUpperCase() as Uppercase<
              `${typeof type}_ONE` | `${typeof type}_OTHER`
            >,
          )}`
        : language.get(`${type}_SHORT`.toUpperCase() as Uppercase<`${typeof type}_SHORT`>)
    }`;
  }

  /**
   * Formats the millisecond count to a human-readable time string.
   *
   * @param milli The number of milliseconds.
   * @param long Whether or not the output should use the interval's long/full form; eg hour or hours instead of h.
   * @param language The language to use for formatting.
   * @returns The formatting count.
   */
  public format(milli: number, long: boolean = true, language?: Language) {
    if (!language) language = this.client.languageHandler.defaultLanguage!;

    const prefix = milli < 0 ? "-" : "";
    const abs = milli < 0 ? -milli : milli;

    if (abs < this.SEC) return `${milli}${long ? " ms" : "ms"}`;
    if (abs < this.MIN) return this._format(abs / this.SEC, prefix, "second", long, language);
    if (abs < this.HOUR) return this._format(abs / this.MIN, prefix, "minute", long, language);
    if (abs < this.DAY) return this._format(abs / this.HOUR, prefix, "hour", long, language);
    if (abs < this.YEAR) return this._format(abs / this.DAY, prefix, "day", long, language);

    return this._format(abs / this.YEAR, prefix, "year", long, language);
  }

  /**
   * Generate a unix timestamp for Discord to be rendered locally per user.
   *
   * @param options - The options to use for the timestamp.
   * @param options.timestamp - The timestamp to use, defaults to the current time.
   * @param options.type - The type of timestamp to generate, defaults to "f".
   * @return The generated timestamp.
   */
  public generateTimestamp(options?: {
    timestamp?: Date | number;
    type?: "D" | "d" | "F" | "f" | "R" | "T" | "t";
  }): string {
    let timestamp = options?.timestamp ?? new Date();
    const type = options?.type ?? "f";
    if (timestamp instanceof Date) timestamp = timestamp.getTime();
    return `<t:${Math.floor(timestamp / 1_000)}:${type}>`;
  }

  /**
   * Generate a unix timestamp for Discord to be rendered locally per user.
   *
   * @param options The options to use for the timestamp.
   * @param options.timestamp The timestamp to use, defaults to the current time.
   * @param options.type The type of timestamp to generate, defaults to "f".
   * @return The generated timestamp.
   */
  // eslint-disable-next-line sonarjs/no-identical-functions
  public static generateTimestamp(options?: {
    timestamp?: Date | number;
    type?: "D" | "d" | "F" | "f" | "R" | "T" | "t";
  }): string {
    let timestamp = options?.timestamp ?? new Date();
    const type = options?.type ?? "f";
    if (timestamp instanceof Date) timestamp = timestamp.getTime();
    return `<t:${Math.floor(timestamp / 1_000)}:${type}>`;
  }

  /**
   * Upload content to a hastebin server.
   *
   * @param content The content to upload to the hastebin server.
   * @param options The options to use for the upload.
   * @param options.server The server to upload to, defaults to the client's configured hastebin server.
   * @param options.type The type of the content, defaults to "md".
   * @returns The URL to the uploaded content.
   */
  public async uploadToHastebin(content: string, options?: { server?: string; type?: string }) {
    try {
      const response = await fetch(`${options?.server ?? this.client.config.hastebin}/documents`, {
        method: "POST",
        body: content,
        headers: {
          "User-Agent": `${this.client.config.botName.toLowerCase().split(" ").join("_")}/${
            this.client.config.version
          }`,
        },
      });

      const responseJSON = await response.json();

      return `${options?.server ?? this.client.config.hastebin}/${responseJSON.key}.${options?.type ?? "md"}`;
    } catch (error) {
      this.client.logger.error(error);
      await this.client.logger.sentry.captureWithExtras(error, {
        Hastebin: options?.server ?? this.client.config.hastebin,
        Content: content,
      });

      return null;
    }
  }

  /**
   * Upload content to a hastebin server. This is a static method.
   *
   * @param content The content to upload to the hastebin server.
   * @param options The options to use for the upload.
   * @param options.server The server to upload to, defaults to the client's configured hastebin server.
   * @param options.type The type of the content, defaults to "md".
   * @returns The URL to the uploaded content.
   */
  public static async uploadToHastebin(content: string, options?: { server?: string; type?: string }) {
    try {
      const response = await fetch(`${options?.server ?? Config.hastebin}/documents`, {
        method: "POST",
        body: content,
        headers: {
          "User-Agent": `${Config.botName.toLowerCase().split(" ").join("_")}/${Config.version}`,
        },
      });

      const responseJSON = await response.json();

      return `${options?.server ?? Config.hastebin}/${responseJSON.key}.${options?.type ?? "md"}`;
    } catch (error) {
      Logger.error(error);
      await Logger.sentry.captureWithExtras(error, {
        Hastebin: options?.server ?? Config.hastebin,
        Content: content,
      });

      return null;
    }
  }

  /**
   * Verify if the input is a function.
   *
   * @param input The input to verify.
   * @returns Whether the input is a function or not.
   */
  public isFunction(input: any): boolean {
    return typeof input === "function";
  }

  /**
   * Verify if an object is a promise.
   *
   * @param input The object to verify.
   * @returns Whether the object is a promise or not.
   */
  public isThenable(input: any): boolean {
    if (!input) return false;
    return (
      input instanceof Promise ||
      (input !== Promise.prototype && this.isFunction(input.then) && this.isFunction(input.catch))
    );
  }

  /**
   * Hash a string into SHA256.
   *
   * @param string The string to hash.
   * @return The hashed string.
   */
  public hash(string: string): string {
    return createHash("sha256").update(string).digest("hex");
  }

  /**
   * Update a help desk message.
   *
   * @param helpDeskId The ID of the help desk to update.
   */
  public async updateHelpDesk(helpDeskId: string) {
    const helpDesk = await this.client.prisma.helpDesk.findUnique({
      where: { id: helpDeskId },
      include: { helpDeskOptions: { orderBy: { position: "asc" } } },
    });

    if (!helpDesk?.channelId) return;

    let message: APIMessage | undefined;

    const content = {
      embeds: [
        {
          title: helpDesk.name,
          description: `${helpDesk.description ? `${helpDesk.description}\n\n` : ""}${helpDesk.helpDeskOptions
            .map(
              (helpDeskOption) =>
                `${helpDeskOption.emojiName ? `${helpDeskOption.emojiName} ` : ""}${helpDeskOption.name}`,
            )
            .join("\n")}`,
          color: helpDesk.embedColor ? Number.parseInt(helpDesk.embedColor, 16) : this.client.config.colors.primary,
          image: {
            url: "https://cdn.karalite.com/user_2Z1iHO0Px2py0XMFB2sy1mb631L/pixel%20divider.png",
          },
          footer: {
            text: helpDesk.footer,
            icon_url: helpDesk.footerIconUrl,
          },
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              custom_id: `helpDesk.${helpDesk.id}`,
              type: ComponentType.StringSelect,
              placeholder: "Select an option...",
              options: helpDesk.helpDeskOptions.map((helpDeskOption) => {
                const option = {
                  label: helpDeskOption.name,
                  value: helpDeskOption.id,
                } as APISelectMenuOption;

                if (helpDeskOption.description) option.description = helpDeskOption.description;
                if (helpDeskOption.emojiName)
                  option.emoji = { name: helpDeskOption.emojiName, animated: Boolean(option.emoji?.animated) };
                if (helpDeskOption.emojiId) option.emoji!.id = helpDeskOption.emojiId;

                return option;
              }),
            },
          ],
        },
      ],
    } as RESTPostAPIChannelMessageJSONBody;

    if (helpDesk.messageId) {
      try {
        message = await this.client.api.channels.getMessage(helpDesk.channelId, helpDesk.messageId);
      } catch (error) {
        if (error instanceof DiscordAPIError)
          if (error.code === RESTJSONErrorCodes.UnknownMessage) {
            this.client.logger.error(
              `Unable to find help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
            );

            await this.client.prisma.helpDesk.update({
              where: { id: helpDesk.id },
              data: { messageId: null },
            });

            return;
          } else if (error.code === RESTJSONErrorCodes.MissingAccess) {
            this.client.logger.error(
              `Unable to access help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
            );

            return;
          }

        throw error;
      }

      if (!helpDesk.helpDeskOptions.length) {
        try {
          await this.client.api.channels.deleteMessage(helpDesk.channelId, helpDesk.messageId);
        } catch (error) {
          if (error instanceof DiscordAPIError)
            if (error.code === RESTJSONErrorCodes.UnknownMessage) {
              this.client.logger.error(
                `Unable to find help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
              );

              await this.client.prisma.helpDesk.update({
                where: { id: helpDesk.id },
                data: { messageId: null },
              });

              return;
            } else if (error.code === RESTJSONErrorCodes.MissingAccess) {
              this.client.logger.error(
                `Unable to access help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
              );

              return;
            } else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
              this.client.logger.error(
                `Unable to delete help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions.`,
              );

              return;
            }

          throw error;
        }

        this.client.logger.info(
          `Deleted help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} because it had no options.`,
        );

        return;
      }

      try {
        await this.client.api.channels.editMessage(helpDesk.channelId, helpDesk.messageId, content);
      } catch (error) {
        if (error instanceof DiscordAPIError)
          if (error.code === RESTJSONErrorCodes.UnknownMessage) {
            this.client.logger.error(
              `Unable to find help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
            );

            await this.client.prisma.helpDesk.update({
              where: { id: helpDesk.id },
              data: { messageId: null },
            });

            return;
          } else if (error.code === RESTJSONErrorCodes.MissingAccess) {
            this.client.logger.error(
              `Unable to access help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
            );

            return;
          } else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
            this.client.logger.error(
              `Unable to delete help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions.`,
            );

            return;
          }

        throw error;
      }

      this.client.logger.info(
        `Updated help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
      );

      return;
    }

    if (!helpDesk.helpDeskOptions.length) {
      this.client.logger.info(
        `Did not create help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} because it had no options.`,
      );

      return;
    }

    try {
      message = await this.client.api.channels.createMessage(helpDesk.channelId, content);
    } catch (error) {
      if (error instanceof DiscordAPIError)
        if (error.code === RESTJSONErrorCodes.MissingAccess) {
          this.client.logger.error(
            `Unable to access help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`,
          );

          return;
        } else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
          this.client.logger.error(
            `Unable to create help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId} due to missing permissions.`,
          );

          return;
        }

      throw error;
    }

    await this.client.prisma.helpDesk.update({
      where: { id: helpDesk.id },
      data: { messageId: message!.id },
    });

    this.client.logger.info(`Created help desk message for ${helpDesk.name} [${helpDesk.id}] in ${helpDesk.guildId}.`);
  }

  /**
   * Update a BetterStack status report.
   *
   * @param statusReportId The ID of the status report to update.
   */
  public async updateBetterStackStatusReport(statusReportId: string) {
    const statusReportResponse = await fetch(
      `https://betteruptime.com/api/v2/status-pages/162404/status-reports/${statusReportId}`,
      {
        headers: {
          Authorization: `Bearer ${env.BETTER_UPTIME_API_KEY}`,
        },
      },
    );

    const statusReport: { data: BetterStackStatusReport; included: BetterStackStatusUpdate[] } =
      await statusReportResponse.json();

    const existingStatusReports = await this.client.prisma.betterStackStatusReport.findMany({
      where: {
        id: statusReport.data.id,
      },
    });

    const mostRecentStatusUpdate = statusReport.included.sort(
      (a, b) => new Date(b.attributes.published_at).getTime() - new Date(a.attributes.published_at).getTime(),
    )[0];

    const toSend = {
      embeds: [
        {
          title: statusReport.data.attributes.title,
          url: `https://uptime.runpod.io/incident/${statusReport.data.id}`,
          description: statusReport.included
            .sort(
              (a, b) => new Date(a.attributes.published_at).getTime() - new Date(b.attributes.published_at).getTime(),
            )
            .map((statusUpdate) =>
              `${this.client.functions.generateTimestamp({
                timestamp: new Date(statusUpdate.attributes.published_at),
              })} ${statusUpdate.attributes.message}`.replaceAll(" #", "\n#"),
            )
            .join("\n\n"),
          footer: {
            text: mostRecentStatusUpdate?.attributes.affected_resources.every(
              (affectedResource) => affectedResource.status === "resolved",
            )
              ? "Service Restored"
              : mostRecentStatusUpdate?.attributes.affected_resources.some(
                  (affectedResource) => affectedResource.status === "downtime",
                )
              ? "Service Downtime"
              : mostRecentStatusUpdate?.attributes.affected_resources.some(
                  (affectedResource) => affectedResource.status === "degraded",
                )
              ? "Service Degradation"
              : "Planned Maintenance",
          },
          color: mostRecentStatusUpdate?.attributes.affected_resources.every(
            (affectedResource) => affectedResource.status === "resolved",
          )
            ? this.client.config.colors.success
            : mostRecentStatusUpdate?.attributes.affected_resources.some(
                (affectedResource) => affectedResource.status === "downtime",
              )
            ? this.client.config.colors.error
            : mostRecentStatusUpdate?.attributes.affected_resources.some(
                (affectedResource) => affectedResource.status === "degraded",
              )
            ? this.client.config.colors.warning
            : this.client.config.colors.primary,
        },
      ],
      allowed_mentions: { parse: [] },
    } as RESTPostAPIChannelMessageJSONBody;

    const logChannels = await this.client.prisma.logChannel.findMany({
      where: {
        event: "INCIDENT_CREATED",
      },
    });

    if (!logChannels.length && !existingStatusReports.length) return;

    const updates = await Promise.all(
      existingStatusReports.map(async (existingStatusReport) => {
        const message = await this.client.api.channels
          .getMessage(existingStatusReport.channelId, existingStatusReport.messageId)
          .catch(async (error) => {
            if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
              await this.client.prisma.betterStackStatusReport.delete({
                where: { id: existingStatusReport.id },
              });

              return null;
            }

            throw error;
          });

        if (!message) return { channelId: existingStatusReport.channelId, shouldCreate: true };
        else if (
          message.embeds.some((embed, index) => {
            const toSendEmbed = toSend.embeds?.[index];

            return (
              embed.title?.trim() === toSendEmbed?.title?.trim() &&
              embed.description?.trim() === toSendEmbed?.description?.trim() &&
              embed.color === toSendEmbed?.color &&
              embed.footer?.text === toSendEmbed?.footer?.text
            );
          })
        )
          return { channelId: existingStatusReport.channelId, shouldCreate: false };

        await this.client.api.channels.editMessage(
          existingStatusReport.channelId,
          existingStatusReport.messageId,
          toSend,
        );

        return { channelId: existingStatusReport.channelId, shouldCreate: false };
      }),
    );

    const logChannelsToSendTo = logChannels.filter(
      (logChannel) =>
        updates.some(({ channelId, shouldCreate }) => {
          return Boolean(channelId === logChannel.channelId && shouldCreate);
        }) || updates.every(({ channelId }) => channelId !== logChannel.channelId),
    );

    await Promise.all(
      logChannelsToSendTo.map(async (logChannel) =>
        this.client.api.channels
          .createMessage(logChannel.channelId, toSend)
          .then(async (message) =>
            this.client.prisma.betterStackStatusReport.create({
              data: {
                id: statusReport.data.id,
                channelId: logChannel.channelId,
                guildId: logChannel.guildId,
                messageId: message.id,
                startsAt: new Date(statusReport.data.attributes.starts_at),
                statusPageId: statusReport.data.attributes.status_page_id,
                endsAt: statusReport.data.attributes.ends_at ? new Date(statusReport.data.attributes.ends_at) : null,
              },
            }),
          )
          .catch((error) => {
            if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
              this.client.logger.error(`Unable to send message to ${logChannel.channelId} due to missing permissions.`);
            }

            throw error;
          }),
      ),
    );
  }
}
