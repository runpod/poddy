import { env } from "node:process";
import type { EscalatedType } from "@prisma/client";
import {
	type APIModalSubmitGuildInteraction,
	type APIThreadChannel,
	type APIUser,
	MessageFlags,
} from "discord-api-types/v10";
import botConfig from "../../config/bot.config.js";
import type ExtendedClient from "../../lib/extensions/ExtendedClient";
import type { ZendeskCreateTicketRequest, ZendeskCreateTicketResponse } from "../../typings/zendesk";

type SubmittableTicket = {
	subject?: string;
	comment: {
		html_body: string;
		uploads?: string[];
	};
	tags?: string[];
};

export async function submitTicket(
	client: ExtendedClient,
	type: "message" | "thread",
	email: string,
	user: APIUser,
	interaction: APIModalSubmitGuildInteraction,
	ticket: SubmittableTicket,
	thread?: APIThreadChannel,
) {
	const response = await fetch("https://runpodinc.zendesk.com/api/v2/tickets.json", {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${env.ZENDESK_API_KEY}`,
		},
		body: JSON.stringify({
			ticket: {
				subject: ticket.subject ?? `${type[0]?.toUpperCase() + type.slice(1)} Escalated From Discord`, // "message" => "Message", shorter than a ternary
				comment: ticket.comment,
				requester: { email, name: user.username },
				tags: [...(ticket.tags ?? []), "discord"],
			} satisfies ZendeskCreateTicketRequest,
		}),
		method: "POST",
	});

	const lang = client.languageHandler.getLanguage("en-US");

	if (response.status !== 201) {
		const eventId = await client.logger.sentry.captureWithExtras(
			new Error(`Zendesk Ticket Creation Failed With Status ${response.status} (${response.statusText})`),
			{
				response,
			},
		);

		client.api.interactions.editReply(interaction.application_id, interaction.token, {
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
		client.api.channels.editMessage(interaction.channel!.id, interaction.message!.id, {
			embeds: [
				{
					...interaction.message!.embeds![0],
					footer: {
						text: `Ticket ID: #${data.ticket.id}`,
					},
				},
			],
		}),
		client.api.interactions.editReply(interaction.application_id, interaction.token, {
			embeds: [
				{
					title: lang.get("TICKET_CREATED_TITLE"),
					description: lang.get("TICKET_CREATED_DESCRIPTION", {
						ticketId: data.ticket.id,
					}),
					color: client.config.colors.success,
				},
			],
			allowed_mentions: { parse: [], replied_user: true },
			flags: MessageFlags.Ephemeral,
		}),
		client.prisma.zendeskTicket.create({
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
