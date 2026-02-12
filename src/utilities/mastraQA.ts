import { env } from "node:process";
import type { QAAllowedChannel } from "@db/client.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { callMastraAPI } from "@src/utilities/mastra";
import {
	type APIChannel,
	type APIThreadChannel,
	ChannelType,
	type GatewayMessageCreateDispatchData,
} from "discord-api-types/v10";

export async function handleMastraQA(
	client: ExtendedClient,
	message: GatewayMessageCreateDispatchData,
	channel: APIChannel | null,
): Promise<void> {
	const language = client.languageHandler.getLanguage("en-US");

	// If Q&A channels are configured for this guild, verify the current channel is allowed
	const allowedChannels = await client.prisma.qAAllowedChannel.findMany({
		where: { guildId: message.guild_id! },
	});

	if (allowedChannels.length > 0) {
		const isAllowed = allowedChannels.some((ch: QAAllowedChannel) => ch.channelId === message.channel_id);
		if (!isAllowed) return;
	}

	// Remove bot mention, preserve other mentions
	const question = message.content.replace(new RegExp(`<@!?${env.APPLICATION_ID}>`, "g"), "").trim();

	if (!question) {
		await client.api.channels.createMessage(message.channel_id, {
			content: language.get("MASTRA_GREETING_MESSAGE"),
			message_reference: { message_id: message.id, fail_if_not_exists: false },
			allowed_mentions: { parse: [], replied_user: true },
		});
		return;
	}

	// Get or create a thread for the Q&A conversation
	const isThread = channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread;
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

	const thinkingMsg = await client.api.channels.createMessage(thread.id, {
		content: language.get("MASTRA_THINKING_MESSAGE"),
	});

	const deleteThinkingMessage = async () => {
		try {
			await client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
		} catch {}
	};

	try {
		const response = await callMastraAPI(question, thread.id, message.guild_id!);
		await deleteThinkingMessage();

		if (!response.success) {
			client.logger.error("Mastra API error:", response.error);
			await client.api.channels.createMessage(thread.id, {
				embeds: [
					{
						title: language.get("AN_ERROR_HAS_OCCURRED_TITLE"),
						description: language.get("AN_ERROR_HAS_OCCURRED_DESCRIPTION"),
						color: client.config.colors.error,
					},
				],
			});
			return;
		}

		// Clean up excessive newlines and add beta disclaimer
		const answer = response.text.replace(/\n{3,}/g, "\n\n") + language.get("MASTRA_BETA_FOOTER");
		const chunks = answer.length > 2000 ? splitMessage(answer) : [answer];

		for (const chunk of chunks) {
			await client.api.channels.createMessage(thread.id, { content: chunk });
		}
	} catch (error) {
		client.logger.error("Error processing question:", error);
		await deleteThinkingMessage();
		await client.api.channels.createMessage(thread.id, {
			embeds: [
				{
					title: language.get("AN_ERROR_HAS_OCCURRED_TITLE"),
					description: language.get("AN_ERROR_HAS_OCCURRED_DESCRIPTION"),
					color: client.config.colors.error,
				},
			],
		});
	}
}

function splitMessage(text: string, maxLength = 2000) {
	const chunks = [];
	let currentChunk = "";

	const lines = text.split("\n");
	for (const line of lines) {
		if (currentChunk.length + line.length + 1 > maxLength) {
			chunks.push(currentChunk);
			currentChunk = line;
		} else {
			currentChunk += (currentChunk ? "\n" : "") + line;
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk);
	}

	return chunks;
}
