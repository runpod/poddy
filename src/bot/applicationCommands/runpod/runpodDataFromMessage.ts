import type { APIMessageApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandType, MessageFlags, PermissionFlagsBits } from "@discordjs/core";
import ApplicationCommand from "@lib/classes/ApplicationCommand.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "@lib/typings/index.js";
import { getRunpodDiscordUser } from "./shared/getRunpodData.js";

export default class ViewUserDataFromMessage extends ApplicationCommand {
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: "View User Data",
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
				type: ApplicationCommandType.Message,
				dm_permission: false,
			},
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIInteractionWithArguments<APIMessageApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		const message = interaction.data.resolved.messages[interaction.data.target_id];

		if (!message) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: "Error",
						description: "Unable to find the message.",
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		return getRunpodDiscordUser(this.client, interaction, message.author.id, language);
	}
}
