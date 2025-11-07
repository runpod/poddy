import type { APIUserApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandType, PermissionFlagsBits } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";
import { getRunpodDiscordUser } from "./shared/getRunpodData.js";

export default class ViewUserData extends ApplicationCommand {
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				name: "View User Data",
				default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
				type: ApplicationCommandType.User,
				dm_permission: false,
			},
		});
	}

	public override async run({
		interaction,
		language,
	}: {
		interaction: APIInteractionWithArguments<APIUserApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		return getRunpodDiscordUser(this.client, interaction, interaction.data.target_id, language);
	}
}
