import { env } from "node:process";
import type { APIChannel, APIThreadChannel, GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import { ChannelType } from "discord-api-types/v10";
import type ExtendedClient from "../../lib/extensions/ExtendedClient.js";
import { callMastraAPI } from "./mastra.js";
import { splitMessage } from "./string.js";

function isThreadChannel(channel: APIChannel | null): boolean {
	return channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread;
}

/**
 * Handle Mastra Q&A when the bot is mentioned
 * Creates a thread, calls Mastra API, and posts the response
 */
export async function handleMastraQA(
	client: ExtendedClient,
	message: GatewayMessageCreateDispatchData,
	channel: APIChannel | null,
): Promise<void> {
	const language = client.languageHandler.getLanguage("en-US");

	// Check if channel is allowed (if restrictions are configured)
	const allowedChannels = await client.prisma.qAAllowedChannel.findMany({
		where: { guildId: message.guild_id! },
	});

	if (allowedChannels.length > 0) {
		const isAllowed = allowedChannels.some((ch) => ch.channelId === message.channel_id);
		if (!isAllowed) return;
	}

	// Only remove bot mention from content, not all mentions
	const question = message.content.replace(new RegExp(`<@!?${env.APPLICATION_ID}>`, "g"), "").trim();

	if (!question) {
		await client.api.channels.createMessage(message.channel_id, {
			content: language.MASTRA_GREETING_MESSAGE,
			message_reference: { message_id: message.id, fail_if_not_exists: false },
			allowed_mentions: { parse: [], replied_user: true },
		});
		return;
	}

	// Create or use existing thread
	const isThread = isThreadChannel(channel);
	let thread: APIThreadChannel;

	try {
		if (isThread) {
			thread = channel as APIThreadChannel;
		} else {
			thread = (await client.api.channels.createThread(
				message.channel_id,
				{ name: `Q&A: ${question.substring(0, 50)}...`, auto_archive_duration: 60 },
				message.id,
			)) as APIThreadChannel;
		}
	} catch (error) {
		client.logger.error("Failed to create thread:", error);
		return;
	}

	// Show thinking message
	const thinkingMsg = await client.api.channels.createMessage(thread.id, {
		content: language.MASTRA_THINKING_MESSAGE,
	});

	const deleteThinkingMessage = async (): Promise<void> => {
		// Silently ignore delete failures - the message may have already been deleted
		try {
			await client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
		} catch {
			// Intentionally empty - deletion failure is non-critical
		}
	};

	try {
		const response = await callMastraAPI(question, thread.id, message.guild_id!);
		await deleteThinkingMessage();

		if (!response.success) {
			await client.api.channels.createMessage(thread.id, { content: `❌ ${response.error}` });
			return;
		}

		const answer = response.text.replace(/\n{3,}/g, "\n\n") + language.MASTRA_BETA_FOOTER;
		const chunks = answer.length > 2000 ? splitMessage(answer) : [answer];

		for (const chunk of chunks) {
			await client.api.channels.createMessage(thread.id, { content: chunk });
		}
	} catch (error) {
		client.logger.error("Error processing question:", error);
		await deleteThinkingMessage();
		await client.api.channels.createMessage(thread.id, { content: language.MASTRA_ERROR_MESSAGE });
	}
}
