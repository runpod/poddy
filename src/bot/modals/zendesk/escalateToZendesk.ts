import { env } from "node:process";
import { MessageFlags } from "@discordjs/core";
import type { APIMessage, APIModalSubmitInteraction, APIThreadChannel } from "@discordjs/core";
import type Language from "../../../../lib/classes/Language.js";
import Modal from "../../../../lib/classes/Modal.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";

interface TicketCreatedResponse {
	ticket: {
		assignee_id: number;
		collaborator_ids: number[];
		created_at: string;
		custom_fields: { id: number; value: string }[];
		custom_status_id: number;
		description: string;
		due_at: string;
		external_id: string;
		follower_ids: number[];
		from_messaging_channel: boolean;
		group_id: number;
		id: number;
		organization_id: number;
		priority: string;
		problem_id: number;
		raw_subject: string;
		recipient: string;
		requester_id: number;
		satisfaction_rating: {
			comment: string;
			id: number;
			score: string;
		};
		sharing_agreement_ids: number[];
		status: string;
		subject: string;
		tags: string[];
		updated_at: string;
		url: string;
		via: {
			channel: string;
		};
	};
}

interface ZendeskAttachment {
	content_type: string;
	content_url: string;
	file_name: string;
	id: string;
	url: string;
}

interface ZendeskUploadResponse {
	upload: {
		attachment: ZendeskAttachment;
		attachments: ZendeskAttachment[];
		expires_at: string;
		token: string;
	};
}

export default class EscalateToZendesk extends Modal {
	/**
	 * Create our escalate to Zendesk modal.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "escalateToZendesk",
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIModalSubmitInteraction;
		language: Language;
		shardId: number;
	}) {
		await this.client.api.interactions.defer(interaction.id, interaction.token, {
			flags: MessageFlags.Ephemeral,
		});

		const [_, type, id, userId] = interaction.data.custom_id.split(".") as [
			string,
			"message" | "thread",
			string,
			string,
		];

		const user = await this.client.api.users.get(userId);
		const email = interaction.data.components[0]!.components[0]!.value;

		if (type === "message") {
			const message = await this.client.api.channels.getMessage(interaction.channel!.id, id);

			const uploadTokens = await Promise.all(
				message.attachments.map(async (attachment) => {
					const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

					const response = await fetch(
						`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
						{
							headers: {
								Authorization: `Basic ${env.ZENDESK_API_KEY}`,
								"Content-Type": attachment.content_type!,
							},
							body: buffer,
							method: "POST",
						},
					);

					const data: ZendeskUploadResponse = await response.json();

					return data.upload.token;
				}),
			);

			const response = await fetch("https://runpodinc.zendesk.com/api/v2/tickets.json", {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${env.ZENDESK_API_KEY}`,
				},
				body: JSON.stringify({
					ticket: {
						subject: "Message Escalated From Discord",
						comment: {
							html_body: `${user.username} [${
								user.id
							}] escalated <a href="https://discord.com/channels/${interaction.guild_id!}/${message.channel_id}/${
								message.id
							}">this message</a> from Discord:\n\n${
								message.author.username
							} [${message.author.id}]: ${message.content}`,
							uploads: uploadTokens,
						},
						requester: { email, name: user.username },
					},
				}),
				method: "POST",
			});

			if (response.status !== 201) {
				const eventId = await this.client.logger.sentry.captureWithExtras(
					new Error(`Zendesk Ticket Creation Failed With Status ${response.status} (${response.statusText})`),
					{
						response,
					},
				);

				return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
					embeds: [
						{
							title: language.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
							description: language.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
							footer: {
								text: language.get("SENTRY_EVENT_ID_FOOTER", {
									eventId,
								}),
							},
							color: this.client.config.colors.error,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				});
			}

			const data: TicketCreatedResponse = await response.json();

			return Promise.all([
				this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
					embeds: [
						{
							title: language.get("TICKET_CREATED_TITLE"),
							description: language.get("TICKET_CREATED_DESCRIPTION", {
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
						escalatedId: message.id,
						escalatedById: userId,
						type: "MESSAGE",
					},
				}),
			]);
		}

		const thread = (await this.client.api.channels.get(id)) as APIThreadChannel;

		const response = await fetch("https://runpodinc.zendesk.com/api/v2/tickets.json", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${env.ZENDESK_API_KEY}`,
			},
			body: JSON.stringify({
				ticket: {
					subject: "Thread Escalated From Discord",
					comment: {
						html_body: `${user.username} [${
							user.id
						}] escalated <a href="https://discord.com/channels/${thread.guild_id!}/${
							thread.id
						}">this thread</a> from Discord, all messages in the thread are included below as internal notes.`,
					},
					requester: { email, name: user.username },
				},
			}),
			method: "POST",
		});

		if (response.status !== 201) {
			const eventId = await this.client.logger.sentry.captureWithExtras(
				new Error(`Zendesk Ticket Creation Failed With Status ${response.status} (${response.statusText})`),
				{
					response,
				},
			);

			return this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: language.get("ESCALATED_TO_ZENDESK_ERROR_TITLE"),
						description: language.get("ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION"),
						footer: {
							text: language.get("SENTRY_EVENT_ID_FOOTER", {
								eventId,
							}),
						},
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});
		}

		const data: TicketCreatedResponse = await response.json();

		const allMessages: APIMessage[] = [];

		let messages = await this.client.api.channels.getMessages(thread.id, {
			limit: 100,
		});

		allMessages.push(...messages.filter((message) => !message.author.bot));

		this.client.logger.info(
			`Fetched ${messages.length} initial messages for thread ${thread.name} (${thread.id}) while escalating thread to ZenDesk.`,
		);

		while (messages.length === 100) {
			messages = await this.client.api.channels.getMessages(thread.id, {
				limit: 100,
				before: messages[messages.length - 1]!.id,
			});

			allMessages.push(...messages.filter((message) => !message.author.bot));

			this.client.logger.info(
				`Fetched ${messages.length} additional messages (${allMessages.length} total) for thread ${thread.name} (${thread.id}) while escalating thread to ZenDesk.`,
			);
		}

		allMessages.reverse();

		for (const message of allMessages) {
			const uploadTokens = await Promise.all(
				message.attachments.map(async (attachment) => {
					const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

					const response = await fetch(
						`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
						{
							headers: {
								Authorization: `Basic ${env.ZENDESK_API_KEY}`,
								"Content-Type": attachment.content_type!,
							},
							body: buffer,
							method: "POST",
						},
					);

					const data: ZendeskUploadResponse = await response.json();

					return data.upload.token;
				}),
			);

			const commentResponse = await fetch(`https://runpodinc.zendesk.com/api/v2/tickets/${data.ticket.id}.json`, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${env.ZENDESK_API_KEY}`,
				},
				body: JSON.stringify({
					ticket: {
						comment: {
							body: `${message.author.username} [${message.author.id}]: ${message.content}`,
							uploads: uploadTokens,
							public: false,
						},
					},
				}),
				method: "PUT",
			});

			if (commentResponse.status !== 200)
				await this.client.logger.sentry.captureWithExtras(
					new Error(
						`Zendesk Ticket Comment Failed With Status ${commentResponse.status} (${commentResponse.statusText})`,
					),
					{
						response: commentResponse,
					},
				);
		}

		return Promise.all([
			this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: language.get("TICKET_CREATED_TITLE"),
						description: language.get("TICKET_CREATED_DESCRIPTION", {
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
					escalatedId: thread.id,
					escalatedById: userId,
					type: "THREAD",
				},
			}),
		]);
	}
}
