import { env } from "node:process";
import type { EscalatedType } from "@db/client.js";
import { DiscordAPIError } from "@discordjs/rest";
import Functions from "@lib/utilities/functions";
import type {
	BetterStackIndexResponse,
	BetterStackResourceStatus,
	BetterStackStatusReport,
	BetterStackStatusUpdate,
} from "@src/typings/betterstack.js";
import type {
	ZendeskCreateTicketRequest,
	ZendeskCreateTicketResponse,
	ZendeskUploadResponse,
} from "@src/typings/zendesk.js";
import {
	type APIMessage,
	type APIModalSubmitGuildInteraction,
	type APIUser,
	ButtonStyle,
	MessageFlags,
	RESTJSONErrorCodes,
	type RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import botConfig from "../../config/bot.config.js";

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
		escalatedId: string,
		interaction: APIModalSubmitGuildInteraction,
		ticket: SubmittableTicket,
	) {
		if (!email) return;

		const lang = this.client.languageHandler.getLanguage("en-US");

		const existingTicket = await this.client.prisma.zendeskTicket.findUnique({
			where: { escalatedId },
		});

		if (existingTicket) {
			await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
				embeds: [
					{
						title: lang.get("TICKET_ALREADY_EXISTS_TITLE"),
						description: lang.get("TICKET_ALREADY_EXISTS_DESCRIPTION", {
							ticketId: existingTicket.id,
						}),
						color: this.client.config.colors.success,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});
			return null;
		}

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

		if (response.status !== 201) {
			const eventId = await this.client.logger.sentry.captureWithExtras(
				new Error(`Zendesk Ticket Creation Failed With Status ${response.status} (${response.statusText})`),
				{
					response,
				},
			);

			await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
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

		await this.client.prisma.zendeskTicket.createMany({
			data: [
				{
					id: data.ticket.id,
					escalatedId,
					escalatedById: user.id,
					type: type.toUpperCase() as EscalatedType,
				},
			],
			skipDuplicates: true,
		});

		const disabledComponents = interaction.message!.components?.map((row: any) => ({
			...row,
			components: row.components?.map((component: any) => ({
				...component,
				disabled: true,
				style: ButtonStyle.Secondary,
			})),
		}));

		await this.client.api.channels.editMessage(interaction.channel!.id, interaction.message!.id, {
			embeds: [
				{
					...interaction.message!.embeds![0],
					description: lang.get("TICKET_CREATED_EMBED_DESCRIPTION", {
						ticketId: data.ticket.id,
					}),
					color: this.client.config.colors.success,
				},
			],
			components: disabledComponents,
		});

		await this.client.api.interactions.editReply(interaction.application_id, interaction.token, {
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
		});

		return data;
	}

	public async uploadAttachmentsToZendesk(
		attachments: { url: string; filename: string; content_type?: string | null }[],
	): Promise<string[]> {
		return Promise.all(
			attachments.map(async (attachment) => {
				const buffer = await fetch(attachment.url).then(async (res) => res.arrayBuffer());

				const response = await fetch(
					`https://runpodinc.zendesk.com/api/v2/uploads.json?filename=${attachment.filename}`,
					{
						headers: {
							Authorization: `Basic ${env.ZENDESK_API_KEY}`,
							"Content-Type": attachment.content_type ?? "application/octet-stream",
						},
						body: buffer,
						method: "POST",
					},
				);

				if (!response.ok) {
					throw new Error(
						`Zendesk Upload Failed With Status ${response.status} (${response.statusText}) for ${attachment.filename}`,
					);
				}

				const data: ZendeskUploadResponse = await response.json();
				return data.upload.token;
			}),
		);
	}

	public async addTicketInternalNote(
		ticketId: number,
		message: {
			author: { username: string; id: string };
			content: string;
			attachments: { url: string; filename: string; content_type?: string | null }[];
		},
	) {
		const uploadTokens = await this.uploadAttachmentsToZendesk(message.attachments);

		const response = await fetch(`https://runpodinc.zendesk.com/api/v2/tickets/${ticketId}.json`, {
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

		if (!response.ok) {
			throw new Error(`Zendesk Ticket Comment Failed With Status ${response.status} (${response.statusText})`);
		}
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

		this.client.logger.info(`Fetched ${messages.length} initial messages for thread ${threadId}`);

		while (messages.length === 100 && (!limit || allMessages.length < limit)) {
			messages = await this.client.api.channels.getMessages(threadId, {
				limit: 100,
				before: messages[messages.length - 1]!.id,
			});

			const filteredMessages = messages.filter((message) => (excludeBots ? !message.author.bot : true));

			if (limit && allMessages.length + filteredMessages.length > limit) {
				const remaining = limit - allMessages.length;
				allMessages.push(...filteredMessages.slice(0, remaining));
				break;
			}

			allMessages.push(...filteredMessages);

			this.client.logger.info(
				`Fetched ${messages.length} additional messages (${allMessages.length} total) for thread ${threadId}`,
			);
		}

		if (sortOrder === "chronological") {
			allMessages.reverse();
		}

		this.client.logger.info(`Completed fetching ${allMessages.length} messages from thread ${threadId}`);
		return allMessages;
	}

	/**
	 * Update a BetterStack status report.
	 *
	 * @param statusReportId The ID of the status report to update.
	 * @param indexData The full index response from the public API.
	 */
	public async updateBetterStackStatusReport(statusReportId: string, indexData: BetterStackIndexResponse) {
		const statusReport = indexData.included.find(
			(item): item is BetterStackStatusReport => item.type === "status_report" && item.id === statusReportId,
		);

		if (!statusReport) {
			this.client.logger.warn(`BetterStack status report ${statusReportId} not found in index data`);
			return;
		}

		const updateIds = new Set(statusReport.relationships.status_updates.data.map((ref) => ref.id));

		const statusUpdates = indexData.included.filter(
			(item): item is BetterStackStatusUpdate => item.type === "status_update" && updateIds.has(item.id),
		);

		if (!statusUpdates.length) {
			this.client.logger.warn(`BetterStack status report ${statusReportId} has no status updates`);
			return;
		}

		const existingStatusReports = await this.client.prisma.betterStackStatusReport.findMany({
			where: {
				reportId: statusReport.id,
			},
		});

		const incidentStatus = statusReport.attributes.aggregate_state;

		const statusDisplay: Record<BetterStackResourceStatus, { text: string; color: number }> = {
			operational: { text: "Operational", color: this.client.config.colors.success },
			resolved: { text: "Service Restored", color: this.client.config.colors.success },
			downtime: { text: "Service Downtime", color: this.client.config.colors.error },
			degraded: { text: "Service Degradation", color: this.client.config.colors.warning },
			maintenance: { text: "Planned Maintenance", color: this.client.config.colors.primary },
		};

		const toSend = {
			embeds: [
				{
					title: statusReport.attributes.title,
					url: `https://uptime.runpod.io/incident/${statusReport.id}`,
					description: statusUpdates
						.sort(
							(a, b) => new Date(a.attributes.published_at).getTime() - new Date(b.attributes.published_at).getTime(),
						)
						.map((statusUpdate) =>
							`${this.client.functions.generateTimestamp({
								timestamp: new Date(statusUpdate.attributes.published_at),
							})} ${statusUpdate.attributes.message}`.replaceAll(" #", "\n#"),
						)
						.join("\n\n"),
					footer: { text: statusDisplay[incidentStatus].text },
					color: statusDisplay[incidentStatus].color,
				},
			],
			allowed_mentions: { parse: [] },
		} as RESTPostAPIChannelMessageJSONBody;

		const logChannels = await this.client.prisma.logChannel.findMany({
			where: {
				event: "INCIDENT_CREATED",
			},
		});

		if (!logChannels.length && !existingStatusReports.length) {
			this.client.logger.warn(`No INCIDENT_CREATED log channels configured for status report ${statusReportId}`);
			return;
		}

		const updates = await Promise.all(
			existingStatusReports.map(async (existingStatusReport) => {
				const message = await this.client.api.channels
					.getMessage(existingStatusReport.channelId, existingStatusReport.messageId)
					.catch(async (error) => {
						if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
							await this.client.prisma.betterStackStatusReport.delete({
								where: { id: existingStatusReport.id },
							});

							return null;
						}

						throw error;
					});

				if (!message)
					return {
						channelId: existingStatusReport.channelId,
						shouldCreate: true,
					};

				if (
					message.embeds.some((embed, index) => {
						const toSendEmbed = toSend.embeds?.[index];

						return (
							embed.title?.trim() === toSendEmbed?.title?.trim() &&
							embed.description?.trim() === toSendEmbed?.description?.trim() &&
							embed.color === toSendEmbed?.color &&
							embed.footer?.text === toSendEmbed?.footer?.text
						);
					})
				)
					return {
						channelId: existingStatusReport.channelId,
						shouldCreate: false,
					};

				await this.client.api.channels.editMessage(
					existingStatusReport.channelId,
					existingStatusReport.messageId,
					toSend,
				);

				return {
					channelId: existingStatusReport.channelId,
					shouldCreate: false,
				};
			}),
		);

		const logChannelsToSendTo = logChannels.filter(
			(logChannel) =>
				updates.some(({ channelId, shouldCreate }) => {
					return Boolean(channelId === logChannel.channelId && shouldCreate);
				}) || updates.every(({ channelId }) => channelId !== logChannel.channelId),
		);

		await Promise.all(
			logChannelsToSendTo.map(async (logChannel) =>
				this.client.api.channels
					.createMessage(logChannel.channelId, toSend)
					.then(async (message) =>
						this.client.prisma.betterStackStatusReport.create({
							data: {
								reportId: statusReport.id,
								channelId: logChannel.channelId,
								guildId: logChannel.guildId,
								messageId: message.id,
								startsAt: new Date(statusReport.attributes.starts_at),
								statusPageId: Number.parseInt(indexData.data.id, 10),
								endsAt: statusReport.attributes.ends_at ? new Date(statusReport.attributes.ends_at) : null,
							},
						}),
					)
					.catch((error) => {
						if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions) {
							this.client.logger.error(`Unable to send message to ${logChannel.channelId} due to missing permissions.`);
							return;
						}

						throw error;
					}),
			),
		);
	}
}
