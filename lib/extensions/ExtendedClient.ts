import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { env } from "node:process";
import { PrismaClient } from "@db/client.js";
import type { APIGuildMember, APIRole, ClientOptions, MappedEvents } from "@discordjs/core";
import { API, Client } from "@discordjs/core";
import type ApplicationCommand from "@lib/classes/ApplicationCommand.js";
import ApplicationCommandHandler from "@lib/classes/ApplicationCommandHandler.js";
import type AutoComplete from "@lib/classes/AutoComplete.js";
import AutoCompleteHandler from "@lib/classes/AutoCompleteHandler.js";
import type Button from "@lib/classes/Button.js";
import ButtonHandler from "@lib/classes/ButtonHandler.js";
import type EventHandler from "@lib/classes/EventHandler.js";
import LanguageHandler from "@lib/classes/LanguageHandler.js";
import Logger from "@lib/classes/Logger.js";
import type Modal from "@lib/classes/Modal.js";
import ModalHandler from "@lib/classes/ModalHandler.js";
import type SelectMenu from "@lib/classes/SelectMenu.js";
import SelectMenuHandler from "@lib/classes/SelectMenuHandler.js";
import type TextCommand from "@lib/classes/TextCommand.js";
import TextCommandHandler from "@lib/classes/TextCommandHandler.js";
import type { BotOptions } from "@lib/typings/options.js";
import Functions from "@lib/utilities/functions.js";
import { PrismaPg } from "@prisma/adapter-pg";
import botConfig from "config/bot.config";
import * as metrics from "datadog-metrics";
import i18next from "i18next";
import intervalPlural from "i18next-intervalplural-postprocessor";

export default class ExtendedClient extends Client {
	/**
	 * An API instance to make using Discord's API much easier.
	 */
	public override readonly api: API;

	/**
	 * The configuration for our bot.
	 */
	public readonly config: typeof botConfig;

	/**
	 * The logger for our bot.
	 */
	public readonly logger: typeof Logger;

	/**
	 * The i18n instance for our bot.
	 */
	public readonly i18n: typeof i18next;

	/**
	 * __dirname is not in our version of ECMA, little workaround...
	 */
	public readonly __dirname: string;

	/**
	 * Our Prisma client, this is an ORM to interact with our PostgreSQL instance.
	 */
	public readonly prisma: TypedPrismaClientOnlyATypeDoNotUse;

	/**
	 * A map of guild ID to user ID, representing a guild and who owns it.
	 */
	public guildOwnersCache: Map<string, string>;

	/**
	 * Guild roles cache.
	 */
	public guildRolesCache: Map<string, Map<string, APIRole>>;

	/**
	 * A cache of the bot's user in different guilds.
	 */
	public guildMeCache: Map<string, APIGuildMember & {}>;

	/**
	 * An approximation of how many users the bot can see.
	 */
	public approximateUserCount: number;

	/**
	 * The language handler for our bot.
	 */
	public readonly languageHandler: LanguageHandler<this>;

	/**
	 * A map of events that our client is listening to.
	 */
	public events: Map<keyof MappedEvents, EventHandler<this>>;

	/**
	 * A map of the application commands that the bot is currently handling.
	 */
	public applicationCommands: Map<string, ApplicationCommand>;

	/**
	 * The application command handler for our bot.
	 */
	public readonly applicationCommandHandler: ApplicationCommandHandler<this>;

	/**
	 * A map of the auto completes that the bot is currently handling.
	 */
	public autoCompletes: Map<string[], AutoComplete>;

	/**
	 * The auto complete handler for our bot.
	 */
	public readonly autoCompleteHandler: AutoCompleteHandler<this>;

	/**
	 * A map of the text commands that the bot is currently handling.
	 */
	public readonly textCommands: Map<string, TextCommand>;

	/**
	 * The text command handler for our bot.
	 */
	public readonly textCommandHandler: TextCommandHandler<this>;

	/**
	 * A map of the buttons that the bot is currently handling.
	 */
	public readonly buttons: Map<string, Button>;

	/**
	 * The button handler for our bot.
	 */
	public readonly buttonHandler: ButtonHandler<this>;

	/**
	 * A map of the select menus the bot is currently handling.
	 */
	public readonly selectMenus: Map<string, SelectMenu>;

	/**
	 * The select menu handler for our bot.
	 */
	public readonly selectMenuHandler: SelectMenuHandler<this>;

	/**
	 * A map of modals the bot is currently handling.
	 */
	public readonly modals: Map<string, Modal>;

	/**
	 * The modal handler for our bot.
	 */
	public readonly modalHandler: ModalHandler<this>;

	/**
	 * Our DataDog client.
	 */
	public readonly dataDog?: typeof metrics;

	/**
	 * A map of guild IDs to a set of user IDs, representing a guild and who is in a voice channel.
	 */
	public readonly usersInVoice: Map<string, Set<string>> = new Map();

	/**
	 * Cache of invites for the guild.
	 */
	public readonly invitesCache = new Map<string, Map<string, number>>();

	/**
	 * A cache for the names of a channel, this has a TTL of thirty seconds.
	 */
	public readonly channelNameCache = new Map<string, string>();

	/**
	 * A cache for authenticated Runpod users (Discord ID -> true if authenticated).
	 */
	public readonly authenticatedUsersCache = new Set<string>();

	/**
	 * The options for our bot.
	 */
	public options: BotOptions;

	public constructor({ rest, gateway, options }: ClientOptions & { options: BotOptions }) {
		super({ rest, gateway });

		this.api = new API(rest);

		this.config = botConfig;
		this.config.version =
			env.NODE_ENV === "production" ? execSync("git rev-parse --short HEAD").toString().trim() : "dev";

		this.logger = Logger;
		this.options = options;

		this.prisma = new PrismaClient({
			adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
			log: [
				{ level: "warn", emit: "stdout" },
				{ level: "error", emit: "stdout" },
				{ level: "query", emit: "event" },
			],
		}).$extends({
			query: {
				$allModels: {
					async $allOperations({ model, operation, args, query }) {
						const before = Date.now();
						const result = await query(args);
						const after = Date.now();

						Logger.debug(`prisma:query`, `${model}.${operation} took ${String(after - before)}ms`);

						return result;
					},
				},
			},
		});

		this.guildOwnersCache = new Map();
		this.guildRolesCache = new Map();
		this.guildMeCache = new Map();

		this.approximateUserCount = 0;

		if (env.DATADOG_API_KEY) {
			// @ts-expect-error
			this.dataDog = metrics.default;

			this.dataDog?.init({
				flushIntervalSeconds: 0,
				apiKey: env.DATADOG_API_KEY,
				prefix: `${this.config.botName.toLowerCase().split(" ").join("_")}.`,
				defaultTags: [`env:${env.NODE_ENV}`],
			});
		}

		this.i18n = i18next;

		this.__dirname = resolve();

		this.languageHandler = new LanguageHandler(this);

		this.applicationCommands = new Map();
		this.applicationCommandHandler = new ApplicationCommandHandler(this);

		this.autoCompletes = new Map();
		this.autoCompleteHandler = new AutoCompleteHandler(this);

		this.textCommands = new Map();
		this.textCommandHandler = new TextCommandHandler(this);

		this.buttons = new Map();
		this.buttonHandler = new ButtonHandler(this);

		this.selectMenus = new Map();
		this.selectMenuHandler = new SelectMenuHandler(this);

		this.modals = new Map();
		this.modalHandler = new ModalHandler(this);

		this.events = new Map();
		void this.loadEvents();
	}

	/**
	 * Start the client.
	 */
	public async start() {
		await this.i18n.use(intervalPlural).init({
			fallbackLng: "en-US",
			resources: {},
			fallbackNS: this.config.botName.toLowerCase().split(" ").join("_"),
			lng: "en-US",
		});

		await this.languageHandler.loadLanguages();
		await this.autoCompleteHandler.loadAutoCompletes();
		await this.applicationCommandHandler.loadApplicationCommands();
		await this.textCommandHandler.loadTextCommands();
		await this.buttonHandler.loadButtons();
		await this.selectMenuHandler.loadSelectMenus();
		await this.modalHandler.loadModals();
	}

	get functions() {
		return new Functions(this);
	}

	/**
	 * Load all the events in the events directory.
	 */
	private async loadEvents() {
		for (const eventFileName of this.functions.getFiles(`${this.__dirname}/dist/src/bot/events`, ".js", true)) {
			const EventFile = await import(`@lib/src/bot/events/${eventFileName}`);

			const event = new EventFile.default(this) as EventHandler<this>;

			event.listen();

			this.events.set(event.name, event);
		}
	}
}

const createTypedPrismaClient = () =>
	new PrismaClient({
		adapter: new PrismaPg({ connectionString: "" }),
		log: [
			{ level: "warn", emit: "stdout" },
			{ level: "error", emit: "stdout" },
			{ level: "query", emit: "event" },
		],
	}).$extends({
		query: {
			$allModels: {
				$allOperations({ args, query }) {
					return query(args);
				},
			},
		},
	});

type TypedPrismaClientOnlyATypeDoNotUse = ReturnType<typeof createTypedPrismaClient>;
