import { env } from "node:process";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import Logger from "./Logger.js";

export default class Server {
	/**
	 * You can technically use any WinterTC compliant framework
	 */
	private readonly router: Hono;

	public constructor() {
		this.router = new Hono();
	}

	public async start() {
		this.registerRoutes();

		serve(
			{
				fetch: this.router.fetch,
				port: Number.parseInt(env.API_PORT, 10),
			},
			(info) => Logger.info(`Hono server started, listening on ${info.address}:${info.port}`),
		);
	}

	private registerRoutes() {
		this.router.get("/ping", (context) => context.text("PONG!"));

		this.router.get("/", (context) => context.redirect("https://discord.gg/runpod"));
	}
}
