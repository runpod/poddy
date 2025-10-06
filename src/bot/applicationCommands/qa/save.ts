import type {
	APIApplicationCommandGuildInteraction,
	APIChatInputApplicationCommandGuildInteraction,
	APIMessage,
} from "@discordjs/core";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
} from "@discordjs/core";
import { DiscordSnowflake } from "@sapphire/snowflake";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";
import type { PoddyClient } from "../../../client.js";
import type PoddyFunctions from "../../../utilities/functions.js";
import { THREAD_SUMMARY_PROMPTS } from "../../../utilities/qa/messages.js";
import { ingestDocument, processRunPodQuery } from "../../../utilities/runpod.js";

export default class Save extends ApplicationCommand {
	/**
	 * Create the save command to archive thread conversations.
	 *
	 * @param client - The Poddy client, for access to the functions.
	 */
	public constructor(client: PoddyClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "SAVE_COMMAND_NAME",
					description: "SAVE_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SAVE_COMMAND_TITLE_OPTION_NAME",
							description: "SAVE_COMMAND_TITLE_OPTION_DESCRIPTION",
						}),
						required: false,
						type: ApplicationCommandOptionType.String,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SAVE_COMMAND_TAGS_OPTION_NAME",
							description: "SAVE_COMMAND_TAGS_OPTION_DESCRIPTION",
						}),
						required: false,
						type: ApplicationCommandOptionType.String,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "SAVE_COMMAND_PROMPT_OPTION_NAME",
							description: "SAVE_COMMAND_PROMPT_OPTION_DESCRIPTION",
						}),
						required: false,
						type: ApplicationCommandOptionType.String,
					},
				],
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
				type: ApplicationCommandType.ChatInput,
				contexts: [InteractionContextType.Guild], // guild only.
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
		interaction: APIInteractionWithArguments<APIChatInputApplicationCommandGuildInteraction>;
		language: Language;
		shardId: number;
	}) {
		if (
			interaction.channel.type !== ChannelType.PublicThread &&
			interaction.channel.type !== ChannelType.PrivateThread &&
			interaction.channel.type !== ChannelType.AnnouncementThread
		) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				content: "This command can only be used in a thread.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// All checks passed, now defer the interaction
		await this.client.api.interactions.defer(interaction.id, interaction.token, {
			flags: MessageFlags.Ephemeral,
		});

		const title =
			interaction.arguments.strings?.[
				this.client.languageHandler.defaultLanguage!.get("SAVE_COMMAND_TITLE_OPTION_NAME")
			]?.value;

		const tags =
			interaction.arguments.strings?.[this.client.languageHandler.defaultLanguage!.get("SAVE_COMMAND_TAGS_OPTION_NAME")]
				?.value;

		const prompt =
			interaction.arguments.strings?.[
				this.client.languageHandler.defaultLanguage!.get("SAVE_COMMAND_PROMPT_OPTION_NAME")
			]?.value;

		const threadMessages = await (this.client.functions as PoddyFunctions).fetchAllThreadMessages(
			interaction.channel.id,
			{
				excludeBots: true,
			},
		);

		if (threadMessages.length === 0) {
			return await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				content: language.get("SAVE_COMMAND_NO_MESSAGES_ERROR"),
			});
		}

		const formattedMessages = this.formatMessages(threadMessages, interaction);

		const summary = await this.generateThreadSummary(formattedMessages, prompt);

		const threadUrl = `https://discord.com/channels/${interaction.guild_id}/${interaction.channel.id}`;

		const document = {
			title: title || `Thread from ${interaction.channel.name}`,
			summary: summary,
			summary_prompt: prompt || "Default summary (main topic, solutions, technical details, outcomes)",
			thread_url: threadUrl,
			thread_id: interaction.channel.id,
			guild_id: interaction.guild_id,
			guild_name: "Runpod", // redundant information
			channel_name: interaction.channel.name,
			parent_channel: "", // inaccessible
			created_at: new Date(DiscordSnowflake.timestampFrom(interaction.channel.id)).toISOString(),
			saved_at: new Date().toISOString(),
			saved_by: {
				id: interaction.member.user.id,
				username: interaction.member.user.username,
			},
			tags: tags ? tags.split(",").map((t) => t.trim()) : [],
			message_count: threadMessages.length,
			participants: [...new Set(threadMessages.map((m) => m.author.username))],
			full_conversation: formattedMessages,
		};

		const success = await ingestDocument(document);

		if (success) {
			await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				content: language.get("SAVE_COMMAND_SUCCESS"),
			});

			return await this.sendAssistantChannelConfirmation(document);
		} else {
			await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				content: language.get("SAVE_COMMAND_ERROR"),
			});

			return;
		}
	}

	private formatMessages(
		messages: APIMessage[],
		interaction: APIInteractionWithArguments<APIApplicationCommandGuildInteraction>,
	) {
		return messages.map((message) => {
			let content = message.content;

			// Add embed information if present
			if (message.embeds && message.embeds.length > 0) {
				message.embeds.forEach((embed) => {
					if (embed.title) content += `\n[Embed: ${embed.title}]`;
					if (embed.description) content += `\n${embed.description}`;
					if (embed.fields) {
						embed.fields.forEach((field) => {
							content += `\n${field.name}: ${field.value}`;
						});
					}
				});
			}

			// Add attachment information
			if (message.attachments && message.attachments.length > 0) {
				message.attachments.forEach((attachment) => {
					content += `\n[Attachment: ${attachment.filename} (${attachment.url})]`;
				});
			}

			return {
				id: message.id,
				author: {
					id: message.author.id,
					username: message.author.username,
					bot: message.author.bot,
				},
				content: content || "[No text content]",
				timestamp: message.timestamp, // This is an ISO8601 timestamp
				message_url: `https://discord.com/channels/${interaction.guild_id}/${message.channel_id}/${message.id}`,
				reply_to: message.message_reference?.message_id ?? null,
			};
		});
	}

	private async generateThreadSummary(messages: any[], customPrompt: string | null = null): Promise<string> {
		try {
			// Prepare the conversation text
			const conversation = messages.map((msg) => `${msg.author.username}: ${msg.content}`).join("\n");

			// Limit conversation length to avoid token limits
			const maxLength = 10000;
			const truncatedConversation =
				conversation.length > maxLength ? `${conversation.substring(0, maxLength)}...[truncated]` : conversation;

			// Build prompt based on whether custom guidance was provided
			const prompt = customPrompt
				? THREAD_SUMMARY_PROMPTS.CUSTOM(truncatedConversation, customPrompt)
				: THREAD_SUMMARY_PROMPTS.DEFAULT(truncatedConversation);

			// Call Runpod with passthrough mode for summarization
			const result = await processRunPodQuery(
				prompt,
				false, // needsRAG = false (use pass_through mode)
				null, // threadContext
				null, // images
				"openai_3.5_turbo",
				0.3, // temperature
				800, // max_tokens
			);

			if (!result.success) {
				throw new Error(result.error || "Summary generation failed");
			}

			return result.answer || "Summary generation completed.";
		} catch (error: any) {
			console.error("Error generating summary:", error.message);
			return "Summary generation failed. See full conversation below.";
		}
	}

	private async sendAssistantChannelConfirmation(document: any) {
		const ASSISTANT_CHANNEL_ID = process.env.ASSISTANT_CHANNEL_ID || "1412842582823800994";

		try {
			const fields = [
				{ name: "📌 Title", value: document.title, inline: true },
				{ name: "💬 Messages", value: String(document.message_count), inline: true },
				{ name: "👥 Participants", value: String(document.participants.length), inline: true },
				{
					name: "📍 Location",
					value: `${document.guild_name}\n${document.parent_channel ? `${document.parent_channel} → ` : ""}${document.channel_name}`,
					inline: false,
				},
				{ name: "💾 Saved By", value: `<@${document.saved_by.id}> (${document.saved_by.username})`, inline: true },
				{ name: "🗂️ Collection", value: "discord", inline: true },
			];

			if (document.tags?.length) {
				fields.push({ name: "🏷️ Tags", value: document.tags.join(", "), inline: false });
			}

			if (
				document.summary_prompt &&
				document.summary_prompt !== "Default summary (main topic, solutions, technical details, outcomes)"
			) {
				fields.push({ name: "🎯 Summary Focus", value: document.summary_prompt, inline: false });
			}

			fields.push({
				name: "🔗 Thread Link",
				value: `[Jump to Thread](${document.thread_url})`,
				inline: false,
			});

			await this.client.api.channels.createMessage(ASSISTANT_CHANNEL_ID, {
				content: "✅ **New documentation saved from Discord thread**",
				embeds: [
					{
						title: "📚 Thread Saved to Discord Bucket",
						description: document.summary.substring(0, 500) + (document.summary.length > 500 ? "..." : ""),
						fields,
						color: 0x00ff00,
						timestamp: new Date().toISOString(),
						footer: {
							text: `Thread ID: ${document.thread_id}`,
						},
					},
				],
			});
		} catch (error: any) {
			console.error("Error sending assistant channel confirmation:", error.message);
		}
	}
}
