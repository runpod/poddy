import { type APIMessageComponentButtonInteraction, MessageFlags } from "@discordjs/core";
import Button from "../../../../lib/classes/Button.js";
import type Language from "../../../../lib/classes/Language.js";
import type ExtendedClient from "../../../../lib/extensions/ExtendedClient.js";

export default class Upvote extends Button {
	/**
	 * Create our upvote button.
	 *
	 * @param client - Our extended client.
	 */
	public constructor(client: ExtendedClient) {
		super(client, {
			name: "upvote",
		});
	}

	/**
	 * Run this button.
	 *
	 * @param options The options to run this button.
	 * @param options.interaction The interaction that triggered this button.
	 * @param options.language The language to use when replying to the interaction.
	 * @param options.shardId The shard ID to use when replying to the interaction.
	 */
	public override async run({
		interaction,
		language,
	}: {
		interaction: APIMessageComponentButtonInteraction;
		language: Language;
		shardId: number;
	}) {
		const submission = await this.client.prisma.submission.findUnique({ where: { messageId: interaction.message.id } });

		if (!submission)
			return this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("NOT_A_SUBMISSION_TITLE"),
						description: language.get("NOT_A_SUBMISSION_DESCRIPTION"),
						color: this.client.config.colors.error,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			});

		return Promise.all([
			this.client.prisma.submissionUpvote.upsert({
				where: {
					userId_eventId: { userId: (interaction.member ?? interaction).user!.id, eventId: submission.eventId },
				},
				create: {
					userId: (interaction.member ?? interaction).user!.id,
					eventId: submission.eventId,
					submissionId: submission.messageId,
				},
				update: {
					submissionId: submission.messageId,
				},
			}),
			this.client.api.interactions.reply(interaction.id, interaction.token, {
				embeds: [
					{
						title: language.get("UP_VOTED_TITLE"),
						description: language.get("UP_VOTED_DESCRIPTION", {
							submissionAuthor: `<@${submission.userId}>`,
						}),
						footer: {
							text: language.get("UP_VOTED_FOOTER"),
						},
						color: this.client.config.colors.success,
					},
				],
				flags: MessageFlags.Ephemeral,
				allowed_mentions: { parse: [], replied_user: true },
			}),
		]);
	}
}
