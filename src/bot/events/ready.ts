import { env } from "node:process";
import type { GatewayReadyDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { schedule } from "node-cron";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type { BetterStackIndexResponse, BetterStackStatusReport } from "../../../typings/index.js";
import type { PoddyClient } from "../../client.js";

export default class Ready extends EventHandler<PoddyClient> {
	public constructor(client: PoddyClient) {
		super(client, GatewayDispatchEvents.Ready, true);
	}

	/**
	 * Contains the initial state information.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#ready
	 */
	public override async run({ shardId, data }: ToEventProps<GatewayReadyDispatchData>) {
		this.client.dataDog?.gauge("guild_count", data.guilds.length, [`shard:${shardId}`]);

		await Promise.all(
			data.guilds.map(async (guild) => {
				this.client.guildOwnersCache.set(guild.id, "");

				try {
					const invites = await this.client.api.guilds.getInvites(guild.id);
					const invitesCache =
						this.client.invitesCache.get(guild.id) ??
						new Map(new Map(invites.map((invite) => [invite.code, invite.uses])));

					this.client.invitesCache.set(guild.id, invitesCache);
				} catch (error) {
					this.client.logger.warn(`Failed to get invites for guild ${guild.id}:`, error);
				}
			}),
		);

		this.client.logger.info(
			`Logged in as ${data.user.username}#${data.user.discriminator} [${data.user.id}] on Shard ${shardId} with ${data.guilds.length} guilds.`,
		);

		schedule("59 23 * * *", async () => {
			const newCommunicators = await this.client.prisma.newCommunicator.findMany({});

			await Promise.all(
				newCommunicators
					.filter((newCommunicator) => newCommunicator.joinedAt.getTime() + 604_800_000 < Date.now())
					.map(async (newCommunicator) =>
						this.client.prisma.newCommunicator.delete({
							where: {
								userId_guildId: {
									guildId: newCommunicator.guildId,
									userId: newCommunicator.userId,
								},
							},
						}),
					),
			);
		});

		const checkBetterStackStatus = async () => {
			try {
				const response = await fetch("https://uptime.runpod.io/index.json");
				const betterStackIndex: BetterStackIndexResponse = await response.json();

				const statusReports = betterStackIndex.included.filter(
					(item): item is BetterStackStatusReport => item.type === "status_report",
				);

				const WEEK_MS = 1_000 * 60 * 60 * 24 * 7;

				await Promise.all(
					statusReports
						.filter((statusReport) => {
							const startTime = new Date(statusReport.attributes.starts_at).getTime();
							const now = Date.now();

							// Show incidents from the past 7 days
							if (statusReport.attributes.report_type === "incident") {
								return startTime >= now - WEEK_MS;
							}

							// Show maintenances in the next 7 days
							if (statusReport.attributes.report_type === "maintenance") {
								return startTime <= now + WEEK_MS;
							}

							return false;
						})
						.map(async (statusReport) =>
							this.client.functions.updateBetterStackStatusReport(statusReport.id, betterStackIndex),
						),
				);
			} catch (error) {
				this.client.logger.warn("Failed to fetch/parse BetterStack Status", error);
			}
		};

		if (env.NODE_ENV === "development") {
			await checkBetterStackStatus();
		}

		schedule("* * * * *", async () => {
			this.client.dataDog?.gauge("guilds", this.client.guildOwnersCache.size);
			this.client.dataDog?.gauge("approximate_user_count", this.client.approximateUserCount);

			for (const [guildId, usersInVoice] of this.client.usersInVoice.entries()) {
				this.client.dataDog?.increment("minutes_in_voice", usersInVoice.size, [`guild:${guildId}`]);
			}

			await checkBetterStackStatus();
		});

		const helpDesks = await this.client.prisma.helpDesk.findMany({
			where: {},
			select: { id: true },
		});

		await Promise.all(helpDesks.map(async (helpDesk) => this.client.functions.updateHelpDesk(helpDesk.id)));

		return this.client.logger.webhookLog("console", {
			content: `${this.client.functions.generateTimestamp()} Logged in as ${
				data.user.username
			}#${data.user.discriminator} [\`${data.user.id}\`] on Shard ${shardId} with ${data.guilds.length} guilds.`,
			allowed_mentions: { parse: [], replied_user: true },
			username: `${this.client.config.botName} | Console Logs`,
		});
	}
}
