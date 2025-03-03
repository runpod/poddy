import { env } from "node:process";
import type { GatewayReadyDispatchData, ToEventProps } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { schedule } from "node-cron";
import EventHandler from "../../../lib/classes/EventHandler.js";
import type ExtendedClient from "../../../lib/extensions/ExtendedClient.js";
import type { BetterStackStatusReport } from "../../../typings/index.js";

export default class Ready extends EventHandler {
	public constructor(client: ExtendedClient) {
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

				const invites = await this.client.api.guilds.getInvites(guild.id);
				const invitesCache =
					this.client.invitesCache.get(guild.id) ??
					new Map(new Map(invites.map((invite) => [invite.code, invite.uses])));

				this.client.invitesCache.set(guild.id, invitesCache);
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

		schedule("* * * * *", async () => {
			this.client.dataDog?.gauge("guilds", this.client.guildOwnersCache.size);
			this.client.dataDog?.gauge("approximate_user_count", this.client.approximateUserCount);

			for (const [guildId, usersInVoice] of this.client.usersInVoice.entries())
				this.client.dataDog?.increment("minutes_in_voice", usersInVoice.size, [`guild:${guildId}`]);

			if (env.DATADOG_API_KEY)
				this.client.dataDog?.flush(
					() => {
						if (env.NODE_ENV === "development") this.client.logger.debug("Flushed DataDog metrics.");
					},
					(error) => {
						this.client.logger.error(error);
						this.client.logger.sentry.captureException(error);
					},
				);

			const betterStackStatusReportsResponse = await fetch(
				"https://betteruptime.com/api/v2/status-pages/162404/status-reports",
				{
					headers: {
						Authorization: `Bearer ${env.BETTER_UPTIME_API_KEY}`,
					},
				},
			);

			const betterStackStatusReports: {
				data: BetterStackStatusReport[];
			} = await betterStackStatusReportsResponse.json();

			await Promise.all(
				betterStackStatusReports.data
					.filter(
						(statusReport) =>
							new Date(statusReport.attributes.starts_at).getTime() >= Date.now() - 1_000 * 60 * 60 * 24 * 7,
					)
					.map(async (statusReport) => this.client.functions.updateBetterStackStatusReport(statusReport.id)),
			);
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
