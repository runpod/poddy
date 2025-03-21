import type { MappedEvents } from "@discordjs/core";
import type ExtendedClient from "../extensions/ExtendedClient.js";

export default class EventHandler<C extends ExtendedClient = ExtendedClient> {
	/**
	 * The name of our event, this is what we will use to listen to the event.
	 */
	public readonly name: keyof MappedEvents;

	/**
	 * Our extended client.
	 */
	public readonly client: C;

	/**
	 * The listener for our events;
	 */
	private readonly _listener;

	/**
	 * Whether or not this event should only be handled once.
	 */
	private readonly once: boolean;

	/**
	 * Create our event handler.
	 *
	 * @param client Our extended client.
	 * @param name The name of our event, this is what we will use to listen to the event.
	 * @param once Whether or not this event should only be handled once.
	 */
	public constructor(client: C, name: keyof MappedEvents, once = false) {
		this.name = name;
		this.client = client;
		this.once = once;
		this._listener = this._run.bind(this);
	}

	/**
	 * Handle the execution of this event, with some error handling.
	 *
	 * @param args The arguments for our event.
	 * @returns The result of our event.
	 */
	private async _run(...args: any[]) {
		this.client.dataDog?.increment("websocket_events", 1, [`type:${this.name}`]);

		try {
			return await this.run(...args);
		} catch (error) {
			this.client.logger.error(error);
			await this.client.logger.sentry.captureWithExtras(error, {
				Event: this.name,
				Arguments: args,
			});
		}
	}

	/**
	 * Handle the execution of this event.
	 *
	 * @param _args The arguments for our event.
	 */
	public async run(..._args: any): Promise<any> {}

	/**
	 * Start listening for this event.
	 */
	public listen() {
		if (this.once) return this.client.once(this.name, this._listener);

		return this.client.on(this.name, this._listener);
	}

	/**
	 * Stop listening for this event.
	 */
	public removeListener() {
		return this.client.off(this.name, this._listener);
	}
}
