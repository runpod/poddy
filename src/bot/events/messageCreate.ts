import type { APIChannel, GatewayMessageCreateDispatchData, WithIntrinsicProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents, RESTJSONErrorCodes } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";

export default class MessageCreate extends EventHandler {
  public constructor(client: ExtendedClient) {
    super(client, GatewayDispatchEvents.MessageCreate);
  }

  /**
   * Handle the creation of a new interaction.
   *
   * https://discord.com/developers/docs/topics/gateway-events#interaction-create
   */
  public override async run({ shardId, data: message }: WithIntrinsicProps<GatewayMessageCreateDispatchData>) {
    if (message.author.bot) return;

    await this.client.prisma.message.create({
      data: {
        id: message.id,
        authorId: message.author.id,
        content: message.content,
        createdAt: new Date(message.timestamp),
        guildId: message.guild_id!,
      },
    });

    let channel: APIChannel | null = null;

    try {
      channel = await this.client.api.channels.get(message.channel_id);
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === RESTJSONErrorCodes.UnknownChannel)
          this.client.logger.error(`Unable to fetch channel ${message.channel_id}.`);
      } else throw error;
    }

    this.client.dataDog.increment("total_messages_sent", 1, [
      `guildId:${message.guild_id ?? "@me"}`,
      `userId:${message.author.id}`,
      `channelId:${message.channel_id}`,
      `channelName:${channel?.name}`,
    ]);

    if (channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread) {
      const parentChannel = await this.client.api.channels.get(message.channel_id);

      if (
        parentChannel.type === ChannelType.GuildText ||
        (parentChannel.type === ChannelType.GuildForum &&
          parentChannel.parent_id !== this.client.config.supportCategoryId)
      )
        this.client.dataDog.increment("total_messages_sent.engaging", 1, [
          `guildId:${message.guild_id ?? "@me"}`,
          `userId:${message.author.id}`,
          `channelId:${message.channel_id}`,
          `channelName:${channel?.name}`,
        ]);
    } else if (channel?.type === ChannelType.GuildText && channel.parent_id !== this.client.config.supportCategoryId) {
      this.client.dataDog.increment("total_messages_sent.engaging", 1, [
        `guildId:${message.guild_id ?? "@me"}`,
        `userId:${message.author.id}`,
        `channelId:${message.channel_id}`,
        `channelName:${channel?.name}`,
      ]);
    }

    if (message.guild_id) {
      // eslint-disable-next-line no-warning-comments
      // TODO: Use new_communicators and new_communicators_first_day metrics in Datadog, this will help us track if average messages sent
      // by new users are consistent with new_communicators (do we on average see a couple of messages per new user, or do we see a lot of
      // messages for certain new users, etc.) This will also enable us to track if new users might be having trouble getting around in the
      // Discord server, and if we need an easier onboarding flow for it.
      if (new Date(message.member!.joined_at).getTime() > Date.now() - 604_800_000)
        this.client.dataDog.increment("total_messages_sent.new_user", 1, [
          `guildId:${message.guild_id}`,
          `userId:${message.author.id}`,
          `channelId:${message.channel_id}`,
          `channelName:${channel?.name}`,
        ]);

      const newCommunicator = await this.client.prisma.newCommunicator.findUnique({
        where: {
          userId_guildId: {
            userId: message.author.id,
            guildId: message.guild_id,
          },
        },
      });

      if (!newCommunicator) {
        await this.client.prisma.newCommunicator.create({
          data: {
            userId: message.author.id,
            guildId: message.guild_id,
            joinedAt: new Date(message.member!.joined_at),
          },
        });

        this.client.dataDog.increment("new_communicators", 1, [`guildId:${message.guild_id}`]);

        if (new Date(message.member!.joined_at).getTime() + 86_400 > Date.now())
          this.client.dataDog.increment("new_communicators_first_day", 1, [`guildId:${message.guild_id}`]);
      }

      const autoThreadChannel = await this.client.prisma.autoThreadChannel.findUnique({
        where: { channelId: message.channel_id },
      });

      if (autoThreadChannel) {
        const name = autoThreadChannel.threadName
          ? autoThreadChannel.threadName
              .replaceAll(
                "{{author}}",
                `${message.author.username}${
                  message.author.discriminator === "0" ? "" : `#${message.author.discriminator}`
                }`,
              )
              .replaceAll("{{content}}", message.content)
          : message.content;

        await this.client.api.channels.createThread(
          message.channel_id,
          {
            name: name.length > 100 ? `${name.slice(0, 97)}...` : name,
          },
          message.id,
        );
      }
    }

    return this.client.textCommandHandler.handleTextCommand({ data: message, shardId });
  }
}
