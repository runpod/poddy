import { env } from "node:process";
import type { APIApplicationCommandInteraction } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags } from "@discordjs/core";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";
import type { APIInteractionWithArguments } from "../../../../typings/index.js";

export default class RedeemCode extends ApplicationCommand {
	/**
	 * Create our redeem code command.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			options: {
				...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
					name: "REDEEM_CODE_COMMAND_NAME",
					description: "REDEEM_CODE_COMMAND_DESCRIPTION",
				}),
				options: [
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "REDEEM_CODE_COMMAND_EVENT_OPTION_NAME",
							description: "REDEEM_CODE_COMMAND_EVENT_OPTION_DESCRIPTION",
						}),
						required: true,
						autocomplete: true,
						type: ApplicationCommandOptionType.String,
					},
					{
						...client.languageHandler.generateLocalizationsForApplicationCommandOptionType({
							name: "REDEEM_CODE_COMMAND_RUNPOD_EMAIL_OPTION_NAME",
							description: "REDEEM_CODE_COMMAND_RUNPOD_EMAIL_OPTION_DESCRIPTION",
						}),
						required: true,
						type: ApplicationCommandOptionType.String,
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
		const id =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("REDEEM_CODE_COMMAND_EVENT_OPTION_NAME")
			]!.value;

		const event = await this.client.prisma.event.findFirst({
			where: {
				codeAmount: { not: null },
				active: true,
				OR: [
					{
						id,
					},
					{
						name: { equals: id, mode: "insensitive" },
					},
				],
			},
		});

		if (!event)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("EVENT_NOT_FOUND_TITLE"),
						description: language.get("EVENT_NOT_FOUND_DESCRIPTION", {
							eventId: id,
						}),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		const email =
			interaction.arguments.strings![
				this.client.languageHandler.defaultLanguage!.get("REDEEM_CODE_COMMAND_RUNPOD_EMAIL_OPTION_NAME")
			]!.value;

		const alreadyGenerated = await this.client.prisma.generatedCode.findFirst({
			where: {
				eventId: event.id,
				OR: [
					{
						userId: (interaction.member ?? interaction).user!.id,
					},
					{
						runpodEmail: email,
					},
				],
			},
		});

		if (alreadyGenerated) {
			await this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("REDEEMED_CODE_TITLE"),
						description: language.get("REDEEMED_CODE_DESCRIPTION", {
							code: alreadyGenerated.code,
							eventId: event.id,
							eventName: event.name,
						}),
						color: this.client.config.colors.success,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

			return;
		}

		const userCreationEpoch = Number(
			(BigInt((interaction.member ?? interaction).user!.id) >> 22n) + 1_420_070_400_000n,
		);

		if (Date.now() - userCreationEpoch < 604_800_000)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("ACCOUNT_TOO_YOUNG_TITLE"),
						description: language.get("ACCOUNT_TOO_YOUNG_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				allowed_mentions: { parse: [], replied_user: true },
				flags: MessageFlags.Ephemeral,
			});

		const userExistsResponse = await fetch("https://api.runpod.io/graphql", {
			method: "POST",
			body: JSON.stringify({
				operationName: "getUserByEmail",
				variables: {
					input: {
						email,
					},
				},
				query:
					"query getUserByEmail($input: UserByEmailInput) {\n  userByEmail(input: $input) {\n    id\n    email  }\n}",
			}),
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.RUNPOD_API_KEY}`,
			},
		});

		const {
			data: userExistsData,
		}: {
			data: {
				userByEmail: {
					email: string;
					id: string;
				}[];
			};
		} = await userExistsResponse.json();

		if (!userExistsData.userByEmail.length)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("NOT_A_VALID_EMAIL_TITLE"),
						description: language.get("NOT_A_VALID_EMAIL_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		const generatedCodeResponse = await fetch("https://api.runpod.io/graphql", {
			method: "POST",
			body: JSON.stringify({
				operationName: "generateCode",
				variables: {
					input: {
						amount: event.codeAmount!,
					},
				},
				query: "mutation generateCode($input: CreateCodeInput) {\n  createCode(input: $input) {\n    id\n  }\n}",
			}),
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.RUNPOD_API_KEY}`,
			},
		});

		const {
			data: generatedCodeData,
		}: {
			data: {
				createCode: {
					id: string;
				};
			};
		} = await generatedCodeResponse.json();

		return Promise.all(
			[
				this.client.prisma.generatedCode.create({
					data: {
						code: generatedCodeData.createCode.id,
						runpodEmail: email,
						userId: (interaction.member ?? interaction).user!.id,
						eventId: event.id,
					},
				}),
				this.client.api.interactions.reply(interaction.id, interaction.token, {
					embeds: [
						{
							title: language.get("REDEEMED_CODE_TITLE"),
							description: language.get("REDEEMED_CODE_DESCRIPTION", {
								code: generatedCodeData.createCode.id,
								eventId: event.id,
								eventName: event.name,
							}),
							color: this.client.config.colors.success,
						},
					],
					flags: MessageFlags.Ephemeral,
					allowed_mentions: { parse: [], replied_user: true },
				}),
			].concat(
				event.codeLogChannelId
					? ([
							this.client.api.channels.createMessage(event.codeLogChannelId, {
								content: language.get("CODE_LOG_MESSAGE", {
									code: generatedCodeData.createCode.id,
									codeAmount: `$${event.codeAmount}`,
									email,
									eventId: event.id,
									eventName: event.name,
									userMention: `<@${(interaction.member ?? interaction).user!.id}>`,
									creationDate: `<t:${Math.floor(userCreationEpoch / 1_000)}:R>`,
									joinDate: `<t:${Math.floor(new Date(interaction.member!.joined_at ?? 0).getTime() / 1_000)}:R>`,
								}),
								allowed_mentions: { parse: [], replied_user: true },
							}),
						] as any[])
					: [],
			),
		);
	}
}
