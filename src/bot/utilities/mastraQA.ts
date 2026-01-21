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

	// Step 1: Check channel permissions
	// If Q&A channels are configured for this guild, verify the current channel is allowed
	const allowedChannels = await client.prisma.qAAllowedChannel.findMany({
		where: { guildId: message.guild_id! },
	});

	// If restrictions exist, ensure this channel is in the allowed list
	if (allowedChannels.length > 0) {
		const isAllowed = allowedChannels.some((ch) => ch.channelId === message.channel_id);
		// Exit early if channel is not allowed - silently ignore the mention
		if (!isAllowed) return;
	}

	// Step 2: Extract the question from the message
	// Remove only the bot mention, preserve other mentions in the question text
	const question = message.content.replace(new RegExp(`<@!?${env.APPLICATION_ID}>`, "g"), "").trim();

	// If user mentioned the bot without a question, send a friendly greeting
	if (!question) {
		await client.api.channels.createMessage(message.channel_id, {
			content: language.MASTRA_GREETING_MESSAGE,
			message_reference: { message_id: message.id, fail_if_not_exists: false },
			allowed_mentions: { parse: [], replied_user: true },
		});
		return;
	}

	// Step 3: Get or create a thread for the Q&A conversation
	// This keeps the conversation organized and allows for follow-up questions
	const isThread = isThreadChannel(channel);
	let thread: APIThreadChannel;

	try {
		// If already in a thread, use it; otherwise create a new one
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
		// Thread creation failed (permissions, rate limit, etc.) - log and exit
		client.logger.error("Failed to create thread:", error);
		return;
	}

	// Step 4: Show a "thinking" indicator while processing
	// This provides immediate feedback to the user that their question was received
	const thinkingMsg = await client.api.channels.createMessage(thread.id, {
		content: language.MASTRA_THINKING_MESSAGE,
	});

	// Helper to clean up the thinking message after we have a response
	const deleteThinkingMessage = async (): Promise<void> => {
		// Silently ignore delete failures - the message may have already been deleted
		try {
			await client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
		} catch {
			// Intentionally empty - deletion failure is non-critical
		}
	};

	// Step 5: Call the Mastra API and handle the response
	try {
		const response = await callMastraAPI(question, thread.id, message.guild_id!);
		await deleteThinkingMessage();

		// If the API returned an error, show it to the user
		if (!response.success) {
			await client.api.channels.createMessage(thread.id, { content: `❌ ${response.error}` });
			return;
		}

		// Step 6: Format and send the response
		// Clean up excessive newlines and add beta disclaimer footer
		const answer = response.text.replace(/\n{3,}/g, "\n\n") + language.MASTRA_BETA_FOOTER;

		// Split message if it exceeds Discord's 2000 character limit
		const chunks = answer.length > 2000 ? splitMessage(answer) : [answer];

		// Send each chunk as a separate message
		for (const chunk of chunks) {
			await client.api.channels.createMessage(thread.id, { content: chunk });
		}
	} catch (error) {
		// Something went wrong (network error, API timeout, etc.)
		client.logger.error("Error processing question:", error);
		await deleteThinkingMessage();
		await client.api.channels.createMessage(thread.id, { content: language.MASTRA_ERROR_MESSAGE });
	}
}
