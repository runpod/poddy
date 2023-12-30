import { env, exit } from "node:process";
import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { fastify } from "fastify";
import Logger from "./Logger.js";

export default class Server {
	/**
	 * The port the server should run on.
	 */
	private readonly port: number;

	/**
	 * Our Fastify instance.
	 */
	private readonly router: FastifyInstance;

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
	 * Create our Fastify server.
	 *
	 * @param port The port the server should run on.
	 */
	public constructor(port: number) {
		this.port = port;

		this.router = fastify({ logger: false, trustProxy: 1 });

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
	}

	/**
	 * Start the server.
	 */
	public async start() {
		this.registerRoutes();

		// eslint-disable-next-line promise/prefer-await-to-callbacks
		this.router.listen({ port: this.port, host: "0.0.0.0" }, (error, address) => {
			if (error) {
				Logger.error(error);
				Logger.sentry.captureException(error);

				exit(1);
			}

			Logger.info(`Fastify server started, listening on ${address}.`);
		});
	}

	/**
	 * Register our routes.
	 */
	private registerRoutes() {
		this.router.get("/ping", (_, response) => response.send("PONG!"));

		this.router.get("/", (_, response) => response.redirect("https://polar.blue"));
	}
}
