import { env } from "node:process";
import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { serve } from "@hono/node-server";
import type { ZapierNotificationType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { schedule } from "node-cron";
import Logger from "./Logger.js";

export default class Server {
	/**
	 * Our Hono instance.
	 */
	private readonly router: Hono;

	/**
	 * Our Prisma client, this is an ORM to interact with our PostgreSQL instance.
	 */
	public readonly prisma: PrismaClient<{
		errorFormat: "pretty";
		log: (
			| {
					emit: "event";
					level: "query";
			  }
			| {
					emit: "stdout";
					level: "error";
			  }
			| {
					emit: "stdout";
					level: "warn";
			  }
		)[];
	}>;

	/**
	 * Our interface to the Discord API.
	 */
	private readonly discordApi = new API(new REST({ version: "10" }).setToken(env.DISCORD_TOKEN));

	/**
	 * Create our Hono server.
	 */
	public constructor() {
		this.router = new Hono();

		this.prisma = new PrismaClient({
			errorFormat: "pretty",
			log: [
				{
					level: "warn",
					emit: "stdout",
				},
				{
					level: "error",
					emit: "stdout",
				},
				{ level: "query", emit: "event" },
			],
		});

		// I forget what this is even used for, but Vlad from https://github.com/vladfrangu/highlight uses it and recommended me to use it a while ago.
		if (env.NODE_ENV === "development") {
			this.prisma.$on("query", (event) => {
				try {
					const paramsArray = JSON.parse(event.params);
					const newQuery = event.query.replaceAll(/\$(?<captured>\d+)/g, (_, number) => {
						const value = paramsArray[Number(number) - 1];

						if (typeof value === "string") return `"${value}"`;
						else if (Array.isArray(value)) return `'${JSON.stringify(value)}'`;

						return String(value);
					});

					Logger.debug("prisma:query", newQuery);
				} catch {
					Logger.debug("prisma:query", event.query, "PARAMETERS", event.params);
				}
			});

			this.prisma.$use(async (params, next) => {
				const before = Date.now();
				// eslint-disable-next-line n/callback-return
				const result = await next(params);
				const after = Date.now();

				Logger.debug("prisma:query", `${params.model}.${params.action} took ${String(after - before)}ms`);

				return result;
			});
		}
		// Cron jobs run in UTC, so this will be at 7AM UTC, which is 12AM PST.
		else
			schedule(`0 7 * * *`, async () => {
				const zapierNotifications = await this.prisma.zapierNotification.findMany({
					where: { timestamp: { gte: new Date(Date.now() - 1_000 * 60 * 60 * 24) } },
				});
				const groups: Record<string, Record<string, string[]>> = {};

				for (const zapierNotification of zapierNotifications) {
					if (!groups[zapierNotification.type]) groups[zapierNotification.type] = {};
					if (!groups[zapierNotification.type]![zapierNotification.message])
						groups[zapierNotification.type]![zapierNotification.message] = [];

					groups[zapierNotification.type]![zapierNotification.message]!.push(zapierNotification.email);
				}

				for (const [type, record] of Object.entries(groups)) {
					for (const [message, emails] of Object.entries(record)) {
						const response = await fetch(
							(type as ZapierNotificationType) === "CUSTOMER_SUCCESS"
								? env.SLACK_CUSTOMER_SUCCESS_HOOK
								: env.SLACK_SALES_HOOK,
							{
								method: "POST",
								body: JSON.stringify({
									text: `*${message}*\n\n${emails.map((email, index) => `${index + 1}. ${email}`).join("\n")}`,
								}),
								headers: {
									"Content-Type": "application/json",
								},
							},
						);

						if (response.status === 200)
							Logger.info(`Successfully sent ${type} notification ${message} with ${emails.length} emails!`);
						else {
							const data = await response.json();

							Logger.info(
								`Failed to send ${type} notification ${message} with ${emails.length} emails!\n${JSON.stringify(
									data,
									null,
									4,
								)}`,
							);
						}
					}
				}
			});
	}

	public async start() {
		this.registerRoutes();

		serve({ fetch: this.router.fetch, port: Number.parseInt(env.API_PORT, 10) }, (info) =>
			Logger.info(`Hono server started, listening on ${info.address}:${info.port}`),
		);
	}

	private registerRoutes() {
		this.router.get("/ping", (context) => context.text("PONG!"));

		this.router.get("/", (context) => context.redirect("https://discord.gg/runpod"));

		this.router.post("/lambda_push", async (context) => {
			if (context.req.header("authorization") !== env.LAMBDA_PUSH_SECRET) {
				context.status(401);

				return context.text("Unauthorized");
			}

			let body: {
				emails: string[];
				group: string;
			};

			try {
				body = await context.req.json();
			} catch {
				context.status(400);

				return context.json({ error: "Invalid JSON" });
			}

			const subscriptionGroup = await this.prisma.subscriptionGroup.findUnique({
				where: { id: body.group },
				include: { subscribedUsers: true },
			});

			if (!subscriptionGroup) {
				context.status(200);

				return context.json({ success: true, message: `I do not listen for "${body.group}"!` });
			}

			const channelsToSendTo: Record<string, string[]> = {};
			let totalUserCount = 0;

			for (const user of subscriptionGroup.subscribedUsers) {
				if (!channelsToSendTo[user.channelId]) channelsToSendTo[user.channelId] = [];

				channelsToSendTo[user.channelId]!.push(user.userId);
				totalUserCount++;
			}

			for (const [channelId, userIds] of Object.entries(channelsToSendTo))
				await this.discordApi.channels.createMessage(channelId, {
					content: `${subscriptionGroup.category ? `${subscriptionGroup.category}\n\n` : ""}${
						subscriptionGroup.description ? subscriptionGroup.description : `**${subscriptionGroup.name}**`
					}\n${body.emails.map((email) => `- \`${email}\``).join("\n")}\n\n${userIds
						.map((userId) => `<@${userId}>`)
						.join(" ")}`,
					allowed_mentions: { users: userIds },
				});

			context.status(200);

			return context.json({
				success: true,
				message: `Sent to ${Object.keys(channelsToSendTo).length} channels with ${totalUserCount} users notified!`,
			});
		});

		this.router.post("/zapier", async (context) => {
			if (context.req.header("authorization") !== env.LAMBDA_PUSH_SECRET) {
				context.status(401);

				return context.text("Unauthorized");
			}

			let body: {
				email: string;
				message: string;
				type: ZapierNotificationType;
			};

			try {
				body = await context.req.json();
			} catch {
				context.status(400);

				return context.json({ error: "Invalid JSON" });
			}

			await this.prisma.zapierNotification.create({ data: body });

			context.status(200);

			return context.json({ success: true });
		});
	}
}
