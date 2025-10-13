import { env } from "node:process";
import type { APIChannel, APIThreadChannel, GatewayMessageCreateDispatchData, ToEventProps } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents, MessageType, RESTJSONErrorCodes } from "@discordjs/core";
import { DiscordAPIError } from "@discordjs/rest";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";
import { classifyQuestionCategory } from "../../utilities/qa/categoryclassifier.js";
import { analyzeQuestionType } from "../../utilities/qa/classifier.js";
import { extractImagesFromThread } from "../../utilities/qa/imageprocessor.js";
import {
	ANIMATION_FRAMES,
	CLARIFICATION_PROMPT,
	CONSTANTS,
	INITIAL_MESSAGES,
	MESSAGES,
} from "../../utilities/qa/messages.js";
import { addBotResponse, addUserMessage, createQAThread, threadExists } from "../../utilities/qa/threads.js";
import { handlePassthroughResponse, handleRAGResponse, processRunpodQuery } from "../../utilities/runpod.js";

/**
 * Split long messages into chunks under Discord's limit
 */
function splitMessage(text: string, maxLength = CONSTANTS.MAX_MESSAGE_LENGTH): string[] {
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

	/**
	 * Handle the creation of a new interaction.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#interaction-create
	 */
	public override async run({ shardId, data: message }: ToEventProps<GatewayMessageCreateDispatchData>) {
		if (message.author.bot || message.type !== MessageType.Default) return;

		await this.client.prisma.message.create({
			data: {
				id: message.id,
				authorId: message.author.id,
				channelId: message.channel_id,
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

		this.client.dataDog?.increment("total_messages_sent", 1, [
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
				this.client.dataDog?.increment("total_messages_sent.engaging", 1, [
					`guildId:${message.guild_id ?? "@me"}`,
					`userId:${message.author.id}`,
					`channelId:${message.channel_id}`,
					`channelName:${channel?.name}`,
				]);
		} else if (channel?.type === ChannelType.GuildText && channel.parent_id !== this.client.config.supportCategoryId) {
			this.client.dataDog?.increment("total_messages_sent.engaging", 1, [
				`guildId:${message.guild_id ?? "@me"}`,
				`userId:${message.author.id}`,
				`channelId:${message.channel_id}`,
				`channelName:${channel?.name}`,
			]);
		}

		if (message.guild_id) {
			if (["1064658510689874040"].includes(message.channel_id)) {
				await fetch("https://changelog.getrunpod.io/webhooks/discord", {
					method: "POST",
					body: JSON.stringify({
						secret: env.CHANGELOG_WEBHOOK_SECRET,
						content: message.content,
						author: message.author.username,
						createdAt: new Date(message.timestamp).toISOString(),
					}),
				});
			}

			// TODO: Use new_communicators and new_communicators_first_day metrics in Datadog, this will help us track if average messages sent
			// by new users are consistent with new_communicators (do we on average see a couple of messages per new user, or do we see a lot of
			// messages for certain new users, etc.) This will also enable us to track if new users might be having trouble getting around in the
			// Discord server, and if we need an easier onboarding flow for it.
			if (new Date(message.member!.joined_at!).getTime() > Date.now() - 604_800_000)
				this.client.dataDog?.increment("total_messages_sent.new_user", 1, [
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
						joinedAt: new Date(message.member!.joined_at!),
					},
				});

				this.client.dataDog?.increment("new_communicators", 1, [`guildId:${message.guild_id}`]);

				if (new Date(message.member!.joined_at!).getTime() + 86_400 > Date.now())
					this.client.dataDog?.increment("new_communicators_first_day", 1, [`guildId:${message.guild_id}`]);
			}

			const autoThreadChannel = await this.client.prisma.autoThreadChannel.findUnique({
				where: { channelId: message.channel_id },
			});

			if (autoThreadChannel) {
				const name = autoThreadChannel.threadName
					? autoThreadChannel.threadName
							.replaceAll("{{author}}", `${message.author.username}`)
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

		// Handle bot mentions for Q&A assistance (only direct mentions, not role mentions or @everyone/@here)
		const botMentionPattern = new RegExp(`<@!?${env.APPLICATION_ID}>`);
		const isBotDirectlyMentioned = botMentionPattern.test(message.content);
		const mentionsEveryone = message.mention_everyone;

		if (isBotDirectlyMentioned && !mentionsEveryone) {
			console.log(`\n🎯 Bot mentioned in channel ${message.channel_id} by user ${message.author?.id}`);

			// Check if channel is allowed for QA (if any restrictions are set)
			const allowedChannels = await this.client.prisma.qAAllowedChannel.findMany({
				where: {
					guildId: message.guild_id!,
				},
			});

			console.log(`📋 Found ${allowedChannels.length} allowed channels configured`);

			// If there are allowed channels configured, check if current channel is in the list
			if (allowedChannels.length > 0) {
				const isAllowed = allowedChannels.some((ch) => ch.channelId === message.channel_id);
				console.log(`🔐 Channel ${message.channel_id} is ${isAllowed ? "allowed" : "NOT allowed"}`);
				if (!isAllowed) {
					// Silently ignore - bot only responds in allowed channels
					return;
				}
			}
			const question = message.content.replace(/<@!?\d+>/g, "").trim();
			console.log(`❓ Question extracted: "${question.substring(0, 50)}..."`);

			if (!question) {
				await this.client.api.channels.createMessage(message.channel_id, {
					content: MESSAGES.GREETING,
					message_reference: {
						message_id: message.id,
						fail_if_not_exists: false,
					},
					allowed_mentions: { parse: [], replied_user: true },
				});
				return;
			}

			// Create or get thread for Q&A conversation
			let thread: APIThreadChannel;
			try {
				console.log(`🧵 Channel type: ${channel?.type}`);
				if (channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread) {
					thread = channel as APIThreadChannel;
					console.log(`✅ Using existing thread: ${thread.id}`);
				} else {
					console.log(`🆕 Creating new thread for question...`);
					thread = (await this.client.api.channels.createThread(
						message.channel_id,
						{
							name: `Q&A: ${question.substring(0, 50)}...`,
							auto_archive_duration: 60,
						},
						message.id,
					)) as APIThreadChannel;
					console.log(`✅ Created thread: ${thread.id}`);
				}
			} catch (error) {
				console.error("❌ Failed to create Q&A thread:", error);
				this.client.logger.error("Failed to create Q&A thread:", error);
				return;
			}

			const images = await extractImagesFromThread(this.client.api, thread.id);
			if (images) {
				console.log(`🖼️ Found ${images.length} total image(s) in the thread for context`);
			}

			let threadContext: string | null = null;
			if (thread.type === ChannelType.PublicThread || thread.type === ChannelType.PrivateThread) {
				try {
					const messages = await this.client.api.channels.getMessages(thread.id, { limit: 5 });
					const previousMessages = messages
						.filter((m) => m.id !== message.id)
						.map((m) => m.content)
						.join("\n");
					if (previousMessages) {
						threadContext = previousMessages.substring(0, 500);
					}
				} catch (err) {
					console.error("Failed to fetch thread context:", err);
				}
			}

			const textToAnalyze = threadContext ? `${threadContext}\n\nNew question: ${question}` : question;
			const hasContext = !!threadContext;
			console.log(`🔬 Analyzing question (hasContext: ${hasContext})...`);
			const analysis = await analyzeQuestionType(textToAnalyze, hasContext);
			console.log(
				`📊 Analysis complete - RAG: ${analysis.needs_rag}, Clarity: ${analysis.clarity}, Complexity: ${analysis.complexity}`,
			);

			if (analysis.clarity === "unclear") {
				const thinkingMsg = await this.client.api.channels.createMessage(thread.id, {
					content: INITIAL_MESSAGES.CLARIFICATION_THINKING,
				});

				let frameIndex = 0;
				const clarificationInterval = setInterval(async () => {
					try {
						await this.client.api.channels.editMessage(thread.id, thinkingMsg.id, {
							content: ANIMATION_FRAMES.CLARIFICATION[frameIndex % ANIMATION_FRAMES.CLARIFICATION.length],
						});
						frameIndex++;
					} catch (_err) {
						clearInterval(clarificationInterval);
					}
				}, CONSTANTS.ANIMATION_INTERVALS.CLARIFICATION);

				try {
					// Generate intelligent clarification using Runpod
					const clarificationResponse = await processRunpodQuery(
						CLARIFICATION_PROMPT(question, images),
						false,
						threadContext,
						images,
						"openai_4o_mini",
					);

					clearInterval(clarificationInterval);

					try {
						await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
					} catch (_err) {
						// Ignore deletion errors
					}

					if (clarificationResponse.success) {
						await this.client.api.channels.createMessage(thread.id, {
							content: clarificationResponse.answer,
						});
						await addBotResponse(this.client.prisma, thread.id, clarificationResponse.answer, "gpt-4o-mini");
					} else {
						await this.client.api.channels.createMessage(thread.id, {
							content: MESSAGES.CLARIFICATION_FALLBACK,
						});
						await addBotResponse(this.client.prisma, thread.id, MESSAGES.CLARIFICATION_FALLBACK, "fallback");
					}
				} catch (error) {
					console.error("Error generating clarification:", error);
					clearInterval(clarificationInterval);

					try {
						await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
					} catch (_err) {
						// Ignore deletion errors
					}

					await this.client.api.channels.createMessage(thread.id, {
						content: MESSAGES.CLARIFICATION_FALLBACK,
					});
					await addBotResponse(this.client.prisma, thread.id, MESSAGES.CLARIFICATION_FALLBACK, "fallback");
				}

				return;
			}

			// Show processing animation for normal questions
			const thinkingMsg = await this.client.api.channels.createMessage(thread.id, {
				content: INITIAL_MESSAGES.PROCESSING_THINKING,
			});

			let frameIndex = 0;
			const processingInterval = setInterval(async () => {
				try {
					await this.client.api.channels.editMessage(thread.id, thinkingMsg.id, {
						content: ANIMATION_FRAMES.PROCESSING[frameIndex % ANIMATION_FRAMES.PROCESSING.length],
					});
					frameIndex++;
				} catch (_err) {
					clearInterval(processingInterval);
				}
			}, CONSTANTS.ANIMATION_INTERVALS.PROCESSING);

			try {
				let response;

				// Decide whether to use RAG or passthrough based on classification
				const useComplexModel = analysis.complexity === "complex";
				if (useComplexModel) {
					console.log("🧠 Using GPT-4o for complex reasoning");
				}

				if (analysis.needs_rag) {
					console.log("🔍 Using RAG to search documentation");

					// Create QA thread entry only when using RAG
					const isNewThread = !(await threadExists(this.client.prisma, thread.id));
					console.log(`📊 Thread ${thread.id} - isNewThread: ${isNewThread}`);

					if (isNewThread) {
						const result = await createQAThread(this.client.prisma, thread.id, "discord", question);
						console.log(`📝 createQAThread result:`, result);
					} else {
						console.log(`💬 Adding user message to existing thread`);
						await addUserMessage(this.client.prisma, thread.id, question);
					}

					response = await handleRAGResponse(question, threadContext, images, useComplexModel);
				} else {
					console.log("🔄 Using passthrough (no RAG needed)");
					response = await handlePassthroughResponse(question, threadContext, images, useComplexModel);
				}

				clearInterval(processingInterval);

				try {
					await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
				} catch (_err) {
					// Ignore deletion errors
				}

				if (response.success) {
					let answer = response.answer || MESSAGES.ERROR_FORMAT_FALLBACK;

					// Clean up excessive blank lines
					answer = answer.replace(/\n{2,}/g, "\n");

					// Add beta message footer
					answer += MESSAGES.BETA_FOOTER;

					// Split long messages if needed
					if (answer.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
						const chunks = splitMessage(answer);
						for (const chunk of chunks) {
							await this.client.api.channels.createMessage(thread.id, {
								content: chunk,
							});
						}
					} else {
						await this.client.api.channels.createMessage(thread.id, {
							content: answer,
						});
					}

					// Save bot response to database (only if RAG was used)
					if (analysis.needs_rag) {
						const llmUsed = response.metadata?.model || (useComplexModel ? "gpt-4o" : "gpt-4o-mini");

						// Classify question category asynchronously (don't block response)
						classifyQuestionCategory(question)
							.then((category) => {
								addBotResponse(this.client.prisma, thread.id, answer, llmUsed, category);
								console.log(`💾 Bot response saved to Q&A database (${response.type} mode, category: ${category})`);
							})
							.catch((err) => {
								console.error("Category classification failed:", err);
								addBotResponse(this.client.prisma, thread.id, answer, llmUsed, "GENERAL");
							});
					}
				} else {
					await this.client.api.channels.createMessage(thread.id, {
						content: `❌ ${response.error || MESSAGES.ERROR_FAILED_RESPONSE}`,
					});
				}
			} catch (error) {
				console.error("Error processing question:", error);
				clearInterval(processingInterval);

				try {
					await this.client.api.channels.deleteMessage(thread.id, thinkingMsg.id);
				} catch (_err) {
					// Ignore deletion errors
				}

				await this.client.api.channels.createMessage(thread.id, {
					content: MESSAGES.ERROR_GENERIC,
				});
			}

			return;
		}

		return this.client.textCommandHandler.handleTextCommand({
			data: message,
			shardId,
		});
	}
}
