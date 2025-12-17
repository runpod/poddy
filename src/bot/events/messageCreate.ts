import { env } from "node:process";
import type { ToEventProps } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import {
	type APIChannel,
	type APIThreadChannel,
	ChannelType,
	GatewayDispatchEvents,
	type GatewayMessageCreateDispatchData,
	MessageType,
	RESTJSONErrorCodes,
} from "discord-api-types/v10";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";
import { callMastraAPI } from "../../utilities/mastra.js";

const MAX_MESSAGE_LENGTH = 2000;
const THINKING_MESSAGE = "🤔 Processing your question...";
const GREETING_MESSAGE = "👋 Hi! Please ask a question and I'll help you!";
const ERROR_MESSAGE = "❌ An error occurred while processing your request. Please try again later.";
const BETA_FOOTER =
	"\n\n*Powered by Runpod AI. This feature is still in beta. If you need more help, feel free to post in our community or [file a ticket](https://contact.runpod.io/hc/en-us/requests/new).*";

function splitMessage(text: string, maxLength = MAX_MESSAGE_LENGTH): string[] {
	const chunks: string[] = [];
	let current = text;

	while (current.length > maxLength) {
		let splitIndex = current.lastIndexOf("\n", maxLength);
		if (splitIndex === -1) splitIndex = current.lastIndexOf(" ", maxLength);
		if (splitIndex === -1) splitIndex = maxLength;

		chunks.push(current.substring(0, splitIndex));
		current = current.substring(splitIndex).trim();
	}

	if (current) chunks.push(current);
	return chunks;
}

export default class MessageCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.MessageCreate);
	}

	public override async run({ shardId, data: message }: ToEventProps<GatewayMessageCreateDispatchData>) {
		if (message.author.bot || message.type !== MessageType.Default) return;

		let channel: APIChannel | null = null;
		try {
			channel = await this.client.api.channels.get(message.channel_id);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) {
				this.client.logger.error(`Unable to fetch channel ${message.channel_id}.`);
			}
			return;
		}

		// Handle bot mentions for Mastra Q&A
		const botMentionPattern = new RegExp(`<@!?${env.APPLICATION_ID}>`);
		const isBotDirectlyMentioned = botMentionPattern.test(message.content);

		if (isBotDirectlyMentioned && !message.mention_everyone) {
			// Check if channel is allowed (if restrictions are configured)
			const allowedChannels = await this.client.prisma.qAAllowedChannel.findMany({
				where: { guildId: message.guild_id! },
			});

			if (allowedChannels.length > 0) {
				const isAllowed = allowedChannels.some((ch) => ch.channelId === message.channel_id);
				if (!isAllowed) return;
			}

			const question = message.content.replace(/<@!?\d+>/g, "").trim();

			if (!question) {
				await this.client.api.channels.createMessage(message.channel_id, {
					content: GREETING_MESSAGE,
					message_reference: { message_id: message.id, fail_if_not_exists: false },
					allowed_mentions: { parse: [], replied_user: true },
				});
				return;
			}

			// Create or use existing thread
			let thread: APIThreadChannel;
			try {
				if (channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread) {
					thread = channel as APIThreadChannel;
				} else {
					thread = (await this.client.api.channels.createThread(
						message.channel_id,
						{ name: `Q&A: ${question.substring(0, 50)}...`, auto_archive_duration: 60 },
						message.id,
					)) as APIThreadChannel;
				}
			} catch (error) {
				console.error("Failed to create thread:", error);
				return;
			}

			// Show thinking message
			const thinkingMsg = await this.client.api.channels.createMessage(thread.id, {
				content: THINKING_MESSAGE,
			});

			try {
				// Pass thread ID and guild ID for conversation memory
				const response = await callMastraAPI(question, thread.id, message.guild_id!);

				// Delete thinking message
				try {
					await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
				} catch {}

				if (response.success) {
					const answer = response.text.replace(/\n{3,}/g, "\n\n") + BETA_FOOTER;

					if (answer.length > MAX_MESSAGE_LENGTH) {
						for (const chunk of splitMessage(answer)) {
							await this.client.api.channels.createMessage(thread.id, { content: chunk });
						}
					} else {
						await this.client.api.channels.createMessage(thread.id, { content: answer });
					}
				} else {
					await this.client.api.channels.createMessage(thread.id, {
						content: `❌ ${response.error}`,
					});
				}
			} catch (error) {
				console.error("Error processing question:", error);
				try {
					await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
				} catch {}
				await this.client.api.channels.createMessage(thread.id, { content: ERROR_MESSAGE });
			}

			return;
		}

		// Pass to text command handler for other commands
		return this.client.textCommandHandler.handleTextCommand({ data: message, shardId });
	}
}
