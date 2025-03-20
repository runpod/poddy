import { env } from "node:process";
import type { GatewayPresenceUpdateData } from "@discordjs/core";
import { ActivityType, GatewayIntentBits, PermissionFlagsBits } from "@discordjs/core";

export default {
	/**
	 * The prefix the bot will use for text commands, the prefix is different depending on the NODE_ENV.
	 */
	prefixes: env.NODE_ENV === "production" ? ["c!"] : ["c!!"],
	/**
	 * The name the bot should use across the bot.
	 */
	botName: "Poddy",

	/**
	 * The bot's current version, this is the first 7 characters from the current Git commit hash.
	 */
	version: "???",
	/**
	 * A list of users that are marked as administrators of the bot, these users have access to eval commands.
	 */
	admins: ["619284841187246090", "194861788926443520"],

	/**
	 * The presence that should be displayed when the bot starts running.
	 */
	presence: {
		status: "online",
		activities: [
			{
				type: ActivityType.Playing,
				name: "with serverless.",
			},
		],
	} as GatewayPresenceUpdateData,

	/**
	 * The hastebin server that we should use for uploading logs.
	 */
	hastebin: "https://hst.sh",

	/**
	 * An object of the type Record<string, string>, the key corelating to when the value (a hexadecimal code) should be used.
	 */
	colors: {
		primary: 0x5865f2,
		success: 0x57f287,
		warning: 0xfee75c,
		error: 0xed4245,
	},

	/**
	 * The list of intents the bot requires to function.
	 */
	intents:
		GatewayIntentBits.Guilds |
		GatewayIntentBits.GuildMembers |
		GatewayIntentBits.GuildModeration |
		GatewayIntentBits.GuildVoiceStates |
		GatewayIntentBits.GuildPresences |
		GatewayIntentBits.GuildMessages |
		GatewayIntentBits.MessageContent |
		GatewayIntentBits.GuildScheduledEvents,

	/**
	 * A list of permissions that the bot needs to function at all.
	 */
	requiredPermissions: PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.SendMessages,

	supportCategoryId: "1066014949182275594",
};
