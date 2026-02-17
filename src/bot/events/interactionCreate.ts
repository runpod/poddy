import type { ToEventProps } from "@discordjs/core";
import EventHandler from "@lib/classes/EventHandler.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import { isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from "discord-api-types/utils";
import type { APIInteraction } from "discord-api-types/v10";
import { GatewayDispatchEvents, InteractionType } from "discord-api-types/v10";

export default class InteractionCreate extends EventHandler {
	public constructor(client: ExtendedClient) {
		super(client, GatewayDispatchEvents.InteractionCreate);
	}

	/**
	 * Handle the creation of a new interaction.
	 *
	 * https://discord.com/developers/docs/topics/gateway-events#interaction-create
	 */
	public override async run({ shardId, data }: ToEventProps<APIInteraction>) {
		if (data.type === InteractionType.ApplicationCommand)
			return this.client.applicationCommandHandler.handleApplicationCommand({
				data,
				shardId,
			});

		if (data.type === InteractionType.ApplicationCommandAutocomplete)
			return this.client.autoCompleteHandler.handleAutoComplete({
				data,
				shardId,
			});

		if (data.type === InteractionType.MessageComponent) {
			if (isMessageComponentButtonInteraction(data))
				return this.client.buttonHandler.handleButton({
					data,
					shardId,
				});

			if (isMessageComponentSelectMenuInteraction(data))
				return this.client.selectMenuHandler.handleSelectMenu({
					data,
					shardId,
				});
		}

		if (data.type === InteractionType.ModalSubmit)
			return this.client.modalHandler.handleModal({
				data,
				shardId,
			});
	}
}
