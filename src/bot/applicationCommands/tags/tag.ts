import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags } from "@discordjs/core";
import ApplicationCommand from "@lib/classes/ApplicationCommand.js";
import type Language from "@lib/classes/Language.js";
import type ExtendedClient from "@lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "@lib/typings/index.js";

export default class Tag extends ApplicationCommand {
	/**
	 * Create our tag command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "TAG_COMMAND_NAME",
					description: "TAG_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "TAG_COMMAND_NAME_OPTION_NAME",
							description: "TAG_COMMAND_NAME_OPTION_DESCRIPTION",
						}),
						type: ApplicationCommandOptionType.String,
						required: true,
						autocomplete: true,
					},
				],
				type: ApplicationCommandType.ChatInput,
			},
		});
	}

	/**
	 * Run this application command.
	 *
	 * @param options - The options for this command.
	 * @param options.shardId - The shard ID that this interaction was received on.
	 * @param options.language - The language to use when replying to the interaction.
	 * @param options.interaction -  The interaction to run this command on.
	 */
	public override async run({
		interaction,
		language,
	}: {
		interaction: APIInteractionWithArguments<APIApplicationCommandInteraction>;
		language: Language;
		shardId: number;
	}) {
		const name =
			interaction.arguments.strings![this.client.languageHandler.defaultLanguage!.get("TAG_COMMAND_NAME_OPTION_NAME")]!
				.value;

		const tag = await this.client.prisma.tag.findFirst({
			where: {
				OR: [
					{ id: name },
					{
						name: {
							equals: name,
							mode: "insensitive",
						},
					},
				],
			},
		});

		if (!tag) {
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("TAG_NOT_FOUND_TITLE"),
						description: language.get("TAG_NOT_FOUND_DESCRIPTION", {
							tagName: name,
						}),
						color: this.client.config.colors.error,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
				flags: MessageFlags.Ephemeral,
			});
		}

		return this.client.api.interactions.reply(interaction.id, interaction.token, {
			content: tag.content,
			allowed_mentions: { parse: [], replied_user: true },
		});
	}
}
