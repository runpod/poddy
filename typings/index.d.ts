import type {
	APIApplicationCommandInteractionDataBooleanOption,
	APIApplicationCommandInteractionDataIntegerOption,
	APIApplicationCommandInteractionDataMentionableOption,
	APIApplicationCommandInteractionDataNumberOption,
	APIApplicationCommandInteractionDataStringOption,
	APIApplicationCommandInteractionDataSubcommandGroupOption,
	APIApplicationCommandInteractionDataSubcommandOption,
	APIAttachment,
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
	APIUser,
} from "@discordjs/core";

export interface InteractionArguments {
	attachments?: Record<string, APIAttachment>;
	booleans?: Record<string, APIApplicationCommandInteractionDataBooleanOption>;
	channels?: Record<string, APIInteractionDataResolvedChannel>;
	focused?:
		| APIApplicationCommandInteractionDataIntegerOption
		| APIApplicationCommandInteractionDataNumberOption
		| APIApplicationCommandInteractionDataStringOption;
	integers?: Record<string, APIApplicationCommandInteractionDataIntegerOption>;
	members?: Record<string, APIInteractionDataResolvedGuildMember>;
	mentionables?: Record<string, APIApplicationCommandInteractionDataMentionableOption>;
	numbers?: Record<string, APIApplicationCommandInteractionDataNumberOption>;
	roles?: Record<string, APIRole>;
	strings?: Record<string, APIApplicationCommandInteractionDataStringOption>;
	subCommand?: APIApplicationCommandInteractionDataSubcommandOption;
	subCommandGroup?: APIApplicationCommandInteractionDataSubcommandGroupOption;
	users?: Record<string, APIUser>;
}

export type APIInteractionWithArguments<T> = T & {
	arguments: InteractionArguments;
};

export interface BetterStackStatusReport {
	attributes: {
		affected_resources: {
			status: string;
			status_page_resource_id: string;
		}[];
		aggregate_state: string;
		ends_at?: string;
		report_type: string;
		starts_at: string;
		status_page_id: number;
		title: string;
	};
	id: string;
	relationships: {
		status_updates?: {
			data: {
				id: string;
				type: string;
			}[];
		};
	};
	type: string;
}

export interface BetterStackStatusUpdate {
	attributes: {
		affected_resources: {
			status: string;
			status_page_resource_id: string;
		}[];
		message: string;
		notify_subscribers: boolean;
		published_at: string;
		published_at_timezone?: string;
		status_report_id: string;
	};
	id: string;
	type: string;
}
