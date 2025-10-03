import { env } from "node:process";
import type { EscalatedType } from "@prisma/client";
import {
	type APIMessage,
	type APIModalSubmitGuildInteraction,
	type APIThreadChannel,
	type APIUser,
	MessageFlags,
} from "discord-api-types/v10";
import botConfig from "../../config/bot.config.js";
import Functions from "../../lib/utilities/functions.js";
import type { ZendeskCreateTicketRequest, ZendeskCreateTicketResponse } from "../../typings/zendesk.js";

type SubmittableTicket = {
	subject?: string;
	comment: {
		html_body: string;
		uploads?: string[];
	};
	tags?: string[];
};

export default class PoddyFunctions extends Functions {
	public async submitTicket(
		type: "message" | "thread",
		email: string | undefined,
		user: APIUser,
		interaction: APIModalSubmitGuildInteraction,
		ticket: SubmittableTicket,
		thread?: APIThreadChannel,
	) {
		if (!email) return;

		const response = await fetch("https://runpodinc.zendesk.com/api/v2/tickets.json", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${env.ZENDESK_API_KEY}`,
			},
			body: JSON.stringify({
				ticket: {
					subject: ticket.subject ?? `${type[0]?.toUpperCase() + type.slice(1)} Escalated From Discord`, // "message" => "Message", shorter than a ternary
					comment: ticket.comment,
					requester: { email, name: interaction.member.user.username },
					tags: ["discord"],
				} satisfies ZendeskCreateTicketRequest,
			}),
			method: "POST",
		});

		const lang = this.client.languageHandler.getLanguage("en-US");

		if (response.status !== 201) {
			const eventId = await this.client.logger.sentry.captureWithExtras(
				new Error(`Zendesk Ticket Creation Failed With Status ${response.status} (${response.statusText})`),
				{
					response,
				},
			);

			this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: lang.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
						description: lang.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
						footer: {
							text: lang.get("SENTRY_EVENT_ID_FOOTER", {
								eventId,
							}),
						},
						color: botConfig.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});
			return null;
		}

		const data: ZendeskCreateTicketResponse = await response.json();

		await Promise.all([
			this.client.api.channels.editMessage(interaction.channel!.id, interaction.message!.id, {
				embeds: [
					{
						...interaction.message!.embeds![0],
						footer: {
							text: `Ticket ID: #${data.ticket.id}`,
						},
					},
				],
			}),
			this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: lang.get("TICKET_CREATED_TITLE"),
						description: lang.get("TICKET_CREATED_DESCRIPTION", {
							ticketId: data.ticket.id,
						}),
						color: this.client.config.colors.success,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
				flags: MessageFlags.Ephemeral,
			}),
			this.client.prisma.zendeskTicket.create({
				data: {
					id: data.ticket.id,
					escalatedId: thread?.id ?? interaction.message!.id,
					escalatedById: user.id,
					type: type.toUpperCase() as EscalatedType,
				},
			}),
		]);

		return data;
	}

	public async fetchAllThreadMessages(
		threadId: string,
		options: {
			excludeBots?: boolean;
			limit?: number;
			sortOrder?: "chronological" | "reverse";
		} = {},
	) {
		const { excludeBots = false, limit, sortOrder = "chronological" } = options;
		const allMessages: APIMessage[] = [];

		let messages = await this.client.api.channels.getMessages(threadId, {
			limit: 100,
		});

		allMessages.push(...messages.filter((message) => (excludeBots ? !message.author.bot : true)));

		console.log(`📚 Fetched ${messages.length} initial messages for thread ${threadId}`);

		while (messages.length === 100 && (!limit || allMessages.length < limit)) {
			messages = await this.client.api.channels.getMessages(threadId, {
				limit: 100,
				before: messages[messages.length - 1]!.id,
			});

			const filteredMessages = messages.filter((message) => (excludeBots ? !message.author.bot : true));

			// If we have a limit, only add what we need
			if (limit && allMessages.length + filteredMessages.length > limit) {
				const remaining = limit - allMessages.length;
				allMessages.push(...filteredMessages.slice(0, remaining));
				break;
			}

			allMessages.push(...filteredMessages);

			console.log(
				`📚 Fetched ${messages.length} additional messages (${allMessages.length} total) for thread ${threadId}`,
			);
		}

		// Sort messages based on requested order
		if (sortOrder === "chronological") {
			allMessages.reverse(); // Discord returns newest first, we want oldest first
		}

		console.log(`✅ Completed fetching ${allMessages.length} messages from thread ${threadId}`);
		return allMessages;
	}
}
