export default {
	LANGUAGE_ENABLED: true,
	LANGUAGE_ID: "en-US",
	LANGUAGE_NAME: "English, US",

	PARSE_REGEX:
		/^(-?(?:\d+)?\.?\d+) *(m(?:illiseconds?|s(?:ecs?)?))?(s(?:ec(?:onds?|s)?)?)?(m(?:in(?:utes?|s)?)?)?(h(?:ours?|rs?)?)?(d(?:ays?)?)?(w(?:eeks?|ks?)?)?(y(?:ears?|rs?)?)?$/,
	MS_OTHER: "ms",
	SECOND_ONE: "second",
	SECOND_OTHER: "seconds",
	SECOND_SHORT: "s",
	MINUTE_ONE: "minute",
	MINUTE_OTHER: "minutes",
	MINUTE_SHORT: "m",
	HOUR_ONE: "hour",
	HOUR_OTHER: "hours",
	HOUR_SHORT: "h",
	DAY_ONE: "day",
	DAY_OTHER: "days",
	DAY_SHORT: "d",
	YEAR_ONE: "year",
	YEAR_OTHER: "years",
	YEAR_SHORT: "y",

	CreateInstantInvite: "Create Invite",
	KickMembers: "Kick Members",
	BanMembers: "Ban Members",
	Administrator: "Administrator",
	ManageChannels: "Manage Channels",
	ManageGuild: "Manage Server",
	AddReactions: "Add Reactions",
	ViewAuditLog: "View Audit Log",
	PrioritySpeaker: "Priority Speaker",
	Stream: "Video",
	ViewChannel: "View Channels",
	SendMessages: "Send Messages and Create Posts",
	SendTTSMessages: "Send Text-To-Speech Messages",
	ManageMessages: "Manage Messages",
	EmbedLinks: "Embed Links",
	AttachFiles: "Attach Files",
	ReadMessageHistory: "Read Message History",
	MentionEveryone: "Mention @everyone, @here, and All Roles",
	UseExternalEmojis: "Use External Emojis",
	ViewGuildInsights: "View Server Insights",
	Connect: "Connect",
	Speak: "Speak",
	MuteMembers: "Mute Members",
	DeafenMembers: "Deafen Members",
	MoveMembers: "Move Members",
	UseVAD: "Use Voice Activity",
	ChangeNickname: "Change Nickname",
	ManageNicknames: "Manage Nicknames",
	ManageRoles: "Manage Roles",
	ManageWebhooks: "Manage Webhooks",
	ManageEmojisAndStickers: "Manage Emojis and Stickers",
	ManageGuildExpressions: "Manage Expressions",
	UseApplicationCommands: "Use Application Commands",
	RequestToSpeak: "Request to Speak",
	ManageEvents: "Manage Events",
	ManageThreads: "Manage Threads and Posts",
	CreatePublicThreads: "Create Public Threads",
	CreatePrivateThreads: "Create Private Threads",
	UseExternalStickers: "Use External Stickers",
	SendMessagesInThreads: "Send Messages in Threads abd Posts",
	UseEmbeddedActivities: "Use Activities",
	ModerateMembers: "Timeout Members",
	ViewCreatorMonetizationAnalytics: "View Creator Monetization Analytics",
	UseSoundboard: "Use Soundboard",
	CreateGuildExpressions: "Create Guild Expressions",
	CreateEvents: "Create Events",
	UseExternalSounds: "Use External Sounds",
	SendVoiceMessages: "Send Voice Messages",
	SendPolls: "Send Polls",
	UseExternalApps: "Use External Apps",
	PinMessages: "Pin Messages",
	BypassSlowmode: "Bypass Slowmode",

	INVALID_ARGUMENT_TITLE: "Invalid Argument",

	INVALID_PATH_TITLE: "Invalid Command",
	INVALID_PATH_DESCRIPTION: "I have absolutely no idea how you reached this response.",

	INTERNAL_ERROR_TITLE: "Internal Error Encountered",
	INTERNAL_ERROR_DESCRIPTION:
		"An internal error has occurred, please try again later. This has already been reported to my developers.",
	SENTRY_EVENT_ID_FOOTER: "Sentry Event ID: {{eventId}}",

	NON_EXISTENT_APPLICATION_COMMAND_TITLE: "This {{type}} Does Not Exist",
	NON_EXISTENT_APPLICATION_COMMAND_DESCRIPTION:
		"You've somehow used a {{type}} that doesn't exist. I've removed the command so this won't happen in the future, this has already been reported to my developers.",

	MISSING_PERMISSIONS_BASE_TITLE: "Missing Permissions",
	MISSING_PERMISSIONS_OWNER_ONLY_DESCRIPTION: "This {{type}} can only be used by the owner of this server!",
	MISSING_PERMISSIONS_DEVELOPER_ONLY_DESCRIPTION: "This {{type}} can only be used by my developers!",
	MISSING_PERMISSIONS_USER_PERMISSIONS_ONE_DESCRIPTION:
		"You are missing the {{missingPermissions}} permission, which is required to use this {{type}}!",
	MISSING_PERMISSIONS_USER_PERMISSIONS_OTHER_DESCRIPTION:
		"You are missing the {{missingPermissions}} permissions, which are required to use this {{type}}!",
	MISSING_PERMISSIONS_CLIENT_PERMISSIONS_ONE_DESCRIPTION:
		"I are missing the {{missingPermissions}} permission, which I need to run this {{type}}!",
	MISSING_PERMISSIONS_CLIENT_PERMISSIONS_OTHER_DESCRIPTION:
		"I are missing the {{missingPermissions}} permissions, which I need to run this {{type}}!",

	TYPE_ON_COOLDOWN_TITLE: "{{type}} On Cooldown",
	TYPE_ON_COOLDOWN_DESCRIPTION: "This {{type}} is on cooldown for another {{formattedTime}}!",
	COOLDOWN_ON_TYPE_TITLE: "Cooldown On All {{type}}",
	COOLDOWN_ON_TYPE_DESCRIPTION: "Please wait a second before running another {{type}}!",

	AN_ERROR_HAS_OCCURRED_TITLE: "An Error Has Occurred",
	AN_ERROR_HAS_OCCURRED_DESCRIPTION:
		"An error has occurred, please try again later. This has already been reported to my developers.",

	PING_COMMAND_NAME: "ping",
	PING_COMMAND_DESCRIPTION: "Pong! Get the current ping / latency of the Poddy.",

	PING: "Ping?",
	PONG: "Pong! (Host latency of {{hostLatency}}ms)",

	CONFIG_COMMAND_NAME: "config",
	CONFIG_COMMAND_DESCRIPTION: "Manage Poddy's config for your server.",

	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_NAME: "auto_thread_channel",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_DESCRIPTION: "Manage auto thread channels for your server.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME: "add",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_DESCRIPTION: "Add an auto thread channel.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The channel to add.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_THREAD_NAME_OPTION_NAME: "thread_name",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_THREAD_NAME_OPTION_DESCRIPTION:
		"The name of the thread to create. Supports variables {{author}} and {{content}}.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME: "remove",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_DESCRIPTION: "Remove an auto thread channel.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The channel to remove.",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME: "list",
	CONFIG_AUTO_THREAD_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_DESCRIPTION: "List all auto thread channels.",

	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_NAME: "auto_tag_on_forum_channel",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_DESCRIPTION: "Manage auto tag on forum channels for your server.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME: "add",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_DESCRIPTION: "Add an auto tag on a forum channel.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The forum channel to add an auto tag on.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_TAG_OPTION_NAME: "tag",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_TAG_OPTION_DESCRIPTION:
		"The tag to add to the forum channel.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME: "remove",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_DESCRIPTION:
		"Remove an auto tag on forum channel.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The forum channel to remove an auto tag from.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_TAG_OPTION_NAME: "tag",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_TAG_OPTION_DESCRIPTION:
		"The tag to remove from the forum channel.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME: "list",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_DESCRIPTION:
		"List all auto tag on forum channels.",

	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_NAME: "log_channels",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_DESCRIPTION: "Manage the log channels for your server.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_NAME: "add",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_DESCRIPTION: "Add a log channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The channel to add as a log channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_ADD_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event to log to the channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_NAME: "remove",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_DESCRIPTION: "Remove a log channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The channel to remove as a log channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_EVENT_OPTION_DESCRIPTION:
		"The event to remove from the channel.",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME: "list",
	CONFIG_LOG_CHANNELS_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_DESCRIPTION: "List all log channels.",

	AUTO_THREADS_LIST_TITLE: "Auto Thread Channels",
	AUTO_THREADS_TITLE_NONE_DESCRIPTION:
		"There are currently no auto thread channels for this server, add some by doing `/config auto_thread_channel add <channel>`!",

	AUTO_THREAD_ADDED_TITLE: "Auto Thread Channel Added",
	AUTO_THREAD_ADDED_DESCRIPTION: "The channel <#{{channelId}}> has been added as an auto thread channel!",

	AUTO_THREAD_REMOVED_TITLE: "Auto Thread Channel Removed",
	AUTO_THREAD_REMOVED_DESCRIPTION: "The channel <#{{channelId}}> has been removed as an auto thread channel!",

	AUTO_TAGS_LIST_TITLE: "Auto Tags On Forum Channels",
	AUTO_TAGS_TITLE_NONE_DESCRIPTION:
		"There are currently no auto tags on forum channels for this server, add some by doing `/config auto_tag_on_forum_channel add <channel> <tag>`!",

	AUTO_TAG_ADDED_TITLE: "Auto Tag On Forum Channel Added",
	AUTO_TAG_ADDED_DESCRIPTION:
		"The tag {{tag}} has been added to the forum channel <#{{channelId}}> as an auto tag on forum channel!",

	AUTO_TAG_REMOVED_TITLE: "Auto Tag On Forum Channel Removed",
	AUTO_TAG_REMOVED_DESCRIPTION:
		"The tag {{tag}} has been removed from the forum channel <#{{channelId}}> as an auto tag on forum channel!",

	EMBED_COMMAND_NAME: "embed",
	EMBED_COMMAND_DESCRIPTION: "Manage Poddy's embeds for your server.",

	EMBED_COMMAND_CREATE_SUB_COMMAND_NAME: "create",
	EMBED_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION: "Create an embed.",
	EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	EMBED_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the embed you want to create.",
	EMBED_COMMAND_CREATE_SUB_COMMAND_DATA_OPTION_NAME: "data",
	EMBED_COMMAND_CREATE_SUB_COMMAND_DATA_OPTION_DESCRIPTION:
		"The data of the embed, usually exported from discohook.org -> JSON Data Editor.",

	EMBED_COMMAND_DELETE_SUB_COMMAND_NAME: "delete",
	EMBED_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION: "Delete an embed.",
	EMBED_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME: "embed",
	EMBED_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the embed you want to delete.",

	EMBED_COMMAND_RENAME_SUB_COMMAND_NAME: "rename",
	EMBED_COMMAND_RENAME_SUB_COMMAND_DESCRIPTION: "Rename an embed.",
	EMBED_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_NAME: "name",
	EMBED_COMMAND_RENAME_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the embed you want to rename.",
	EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_NAME: "new_name",
	EMBED_COMMAND_RENAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION: "The new name of the embed.",

	EMBED_COMMAND_LIST_SUB_COMMAND_DESCRIPTION: "List all embeds.",

	EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME: "preview",
	EMBED_COMMAND_PREVIEW_SUB_COMMAND_DESCRIPTION: "Preview an embed.",
	EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME_OPTION_NAME: "embed",
	EMBED_COMMAND_PREVIEW_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the embed you want to preview.",
	EMBED_COMMAND_PREVIEW_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	EMBED_COMMAND_PREVIEW_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The channel to send the preview in.",

	INVALID_JSON_TITLE: "Invalid JSON",
	INVALID_JSON_DESCRIPTION: "The JSON you provided is invalid.",

	EMBED_CREATED_TITLE: "Embed Created",
	EMBED_CREATED_DESCRIPTION: "Embed **{{embedName}}** `[{{embedId}}]` has been created!",

	PREVIEW_EMBED_BUTTON_LABEL: "Preview Embed",

	EMBED_NOT_FOUND_TITLE: "Embed Not Found",
	EMBED_NOT_FOUND_DESCRIPTION: "An embed with an ID `{{embedId}}` was not found!",

	EMBED_DELETED_TITLE: "Embed Deleted",
	EMBED_DELETED_DESCRIPTION: "Embed **{{embedName}}** `[{{embedId}}]` has been deleted!",

	EMBEDS_LIST_TITLE: "Embeds",
	EMBEDS_LIST_NO_EMBEDS_DESCRIPTION:
		"There are currently no embeds for this server, add some by doing `/embed create`!",

	MISSING_PERMISSIONS_PREVIEW_MESSAGE_TITLE: "Missing Permissions",
	MISSING_PERMISSIONS_PREVIEW_MESSAGE_DESCRIPTION:
		"I'm unable to send a preview of the `{{name}}` embed into {{channel}}!",

	EMBED_PREVIEW_SENT_TITLE: "Embed Preview Sent",
	EMBED_PREVIEW_SENT_DESCRIPTION: "The embed preview has been sent to {{channel}}!",

	JUMP_TO_MESSAGE_BUTTON_LABEL: "Jump To Message",

	EMBED_RENAMED_TITLE: "Embed Renamed",
	EMBED_RENAMED_DESCRIPTION: "Embed **{{oldEmbedName}}** `[{{embedId}}]` has been renamed to **{{newEmbedName}}**!",

	SUBMIT_COMMAND_NAME: "submit",
	SUBMIT_COMMAND_DESCRIPTION: "Submit a file to one of our events.",
	SUBMIT_COMMAND_EVENT_OPTION_NAME: "event",
	SUBMIT_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to submit the file to.",
	SUBMIT_COMMAND_IMAGE_OPTION_NAME: "file",
	SUBMIT_COMMAND_IMAGE_OPTION_DESCRIPTION: "The file you want to submit to the event.",

	FAILED_FETCHING_IMAGE_TITLE: "Failed Fetching Image",
	FAILED_FETCHING_IMAGE_DESCRIPTION: "I was unable to fetch the image you provided, please try again.",

	EVENTS_COMMAND_NAME: "events",
	EVENTS_COMMAND_DESCRIPTION: "Manage Poddy's events system.",

	EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME: "create",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION: "Create an event.",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the event you want to create.",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The channel of the event you want to create.",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME: "description",
	EVENTS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION: "The description of the event you want to create.",

	EVENTS_COMMAND_DELETE_SUB_COMMAND_NAME: "delete",
	EVENTS_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION: "Delete an event.",
	EVENTS_COMMAND_DELETE_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_DELETE_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to delete.",

	EVENTS_COMMAND_LIST_SUB_COMMAND_NAME: "list",
	EVENTS_COMMAND_LIST_SUB_COMMAND_DESCRIPTION: "List all events.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME: "edit",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION: "Edit an event.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NAME: "name",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_DESCRIPTION: "Edit the name of an event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NEW_NAME_OPTION_NAME: "name",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_NAME_SUB_COMMAND_NEW_NAME_OPTION_DESCRIPTION: "The new name of the event.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NAME: "description",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_DESCRIPTION: "Edit the description of an event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NEW_DESCRIPTION_OPTION_NAME: "description",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_DESCRIPTION_SUB_COMMAND_NEW_DESCRIPTION_OPTION_DESCRIPTION:
		"The new description of the event.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_NAME: "channel",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_DESCRIPTION: "Edit the channel of an event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The new channel of the event.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_NAME: "status",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_DESCRIPTION: "Edit the status of an event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_NAME: "status",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_DESCRIPTION: "The new status of the event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_CHOICES_ACTIVE: "Active",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_STATUS_SUB_COMMAND_STATUS_OPTION_CHOICES_INACTIVE: "Inactive",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_NAME: "codes_log_channel",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_DESCRIPTION:
		"Edit the codes log channel of an event.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_EVENT_OPTION_DESCRIPTION:
		"The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODES_LOG_CHANNEL_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The new codes log channel of the event. Leave blank to remove the codes log channel.",

	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_NAME: "code_amount",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_DESCRIPTION:
		"Edit the amount each code for this event should be worth.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to edit.",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_AMOUNT_OPTION_NAME: "amount",
	EVENTS_COMMAND_EDIT_SUB_COMMAND_GROUP_CODE_AMOUNT_SUB_COMMAND_AMOUNT_OPTION_DESCRIPTION:
		"The new amount each code for this event should be worth. Leave blank to remove the code amount.",

	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_NAME: "top_submissions",
	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_DESCRIPTION: "View the top submissions for an event.",
	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_EVENT_OPTION_NAME: "event",
	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_EVENT_OPTION_DESCRIPTION:
		"The event you want to view the top submissions for.",
	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_AMOUNT_OPTION_NAME: "amount",
	EVENTS_COMMAND_TOP_SUBMISSIONS_SUB_COMMAND_AMOUNT_OPTION_DESCRIPTION:
		"The amount of top submissions you want to view.",

	REDEEM_CODE_COMMAND_NAME: "redeem_code",
	REDEEM_CODE_COMMAND_DESCRIPTION: "Redeem a code from an event.",
	REDEEM_CODE_COMMAND_EVENT_OPTION_NAME: "event",
	REDEEM_CODE_COMMAND_EVENT_OPTION_DESCRIPTION: "The event you want to redeem the code from.",
	REDEEM_CODE_COMMAND_RUNPOD_EMAIL_OPTION_NAME: "runpod_email",
	REDEEM_CODE_COMMAND_RUNPOD_EMAIL_OPTION_DESCRIPTION: "The Runpod email to redeem the code with.",

	EVENT_CREATED_TITLE: "Event Created",
	EVENT_CREATED_DESCRIPTION: "Event **{{eventName}}** `[{{eventId}}]` has been created!",

	EVENT_NOT_FOUND_TITLE: "Event Not Found",
	EVENT_NOT_FOUND_DESCRIPTION: "An event with an ID `{{eventId}}` was not found!",

	EVENT_DELETED_TITLE: "Event Deleted",
	EVENT_DELETED_DESCRIPTION: "Event **{{eventName}}** `[{{eventId}}]` has been deleted!",

	EVENTS_LIST_TITLE: "Events",
	EVENTS_LIST_NO_EVENTS_DESCRIPTION:
		"There are currently no events for this server, add some by doing `/events create`!",

	EDITED_EVENT_NAME_TITLE: "Event Name Edited",
	EDITED_EVENT_NAME_DESCRIPTION:
		"The name of the event **{{oldEventName}}** `[{{eventId}}]` has been edited to **{{newEventName}}**!",

	EDITED_EVENT_DESCRIPTION_TITLE: "Event Description Edited",
	EDITED_EVENT_DESCRIPTION_DESCRIPTION:
		"The description of the event **{{eventName}}** `[{{eventId}}]` has been edited to: {{newDescription}}",

	EDITED_EVENT_CHANNEL_TITLE: "Event Channel Edited",
	EDITED_EVENT_CHANNEL_DESCRIPTION:
		"The channel of the event **{{eventName}}** `[{{eventId}}]` has been edited to {{newChannel}}!",

	EDITED_EVENT_STATUS_TITLE: "Event Status Edited",
	EDITED_EVENT_STATUS_DESCRIPTION:
		"The status of the event **{{eventName}}** `[{{eventId}}]` has been edited to {{newStatus}}!",

	EDITED_EVENT_CODES_LOG_CHANNEL_TITLE: "Event Codes Log Channel Edited",
	EDITED_EVENT_CODES_LOG_CHANNEL_DESCRIPTION:
		"The codes log channel of the event **{{eventName}}** `[{{eventId}}]` has been edited to {{newChannel}}!",
	EDITED_EVENT_CODES_LOG_CHANNEL_RESET_DESCRIPTION:
		"The codes log channel of the event **{{eventName}}** `[{{eventId}}]` has been reset!",

	EDITED_EVENT_CODE_AMOUNT_TITLE: "Event Code Amount Edited",
	EDITED_EVENT_CODE_AMOUNT_DESCRIPTION:
		"The code amount of the event **{{eventName}}** `[{{eventId}}]` has been edited to {{newAmount}}!",
	EDITED_EVENT_CODE_AMOUNT_RESET_DESCRIPTION:
		"The code amount of the event **{{eventName}}** `[{{eventId}}]` has been reset!",

	ALREADY_SUBMITTED_TITLE: "Already Submitted",
	ALREADY_SUBMITTED_DESCRIPTION: "You've already submitted a file to this event.",

	SUBMITTED_TITLE: "Submitted",
	SUBMITTED_DESCRIPTION: "Your file has been submitted to the event **{{eventName}}** `[{{eventId}}]`!",

	JUMP_TO_SUBMISSION_BUTTON_LABEL: "Jump To Submission",

	NOT_A_SUBMISSION_TITLE: "Not A Submission",
	NOT_A_SUBMISSION_DESCRIPTION: "The message you up voted is not a valid submission message.",

	UP_VOTED_TITLE: "Up Voted",
	UP_VOTED_DESCRIPTION: "You've up voted the submission by {{submissionAuthor}}!",
	UP_VOTED_FOOTER:
		"You may only vote on a singular submission so if you have already voted, your vote has been changed.",

	NOT_A_VALID_EMAIL_TITLE: "Not A Valid Email",
	NOT_A_VALID_EMAIL_DESCRIPTION: "Please provide a valid Runpod email.",

	REDEEMED_CODE_TITLE: "Redeemed Code",
	REDEEMED_CODE_DESCRIPTION: "`{{code}}` is your code for the event **{{eventName}}** `[{{eventId}}]`.",

	CODE_LOG_MESSAGE:
		"{{userMention}} redeemed the code ||`{{code}}`|| worth {{codeAmount}} under the email ||`{{email}}`|| for the event **{{eventName}}** `[{{eventId}}]`, their account was created at {{creationDate}} and they joined {{joinDate}}!",

	ACCOUNT_TOO_YOUNG_TITLE: "Account Too Young",
	ACCOUNT_TOO_YOUNG_DESCRIPTION: "Your account is too young to redeem a code, please try again later.",

	SUBMISSION_MESSAGE: "{{user}}'s submission.",

	TOP_SUBMISSIONS_TITLE: "Top {{amount}} Submissions",
	TOP_SUBMISSIONS_DESCRIPTION: "The top {{amount}} submissions for the event **{{eventName}}** `[{{eventId}}]` are:",

	INVITES_COMMAND_NAME: "invites",
	INVITES_COMMAND_DESCRIPTION: "Manage Poddy's invite system.",

	INVITES_COMMAND_CREATE_SUB_COMMAND_NAME: "create",
	INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION: "Create an invite.",
	INVITES_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	INVITES_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the invite you want to create.",
	INVITES_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_NAME: "channel",
	INVITES_COMMAND_CREATE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION: "The channel of the invite you want to create.",
	INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_NAME: "description",
	INVITES_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION:
		"The description of the invite you want to create.",
	INVITES_COMMAND_CREATE_SUB_COMMAND_EXPIRATION_OPTION_NAME: "expiration",
	INVITES_COMMAND_CREATE_SUB_COMMAND_EXPIRATION_OPTION_DESCRIPTION:
		"The expiration of the invite you want to create in seconds, 0 for unlimited. (Defaults to 0)",
	INVITES_COMMAND_CREATE_SUB_COMMAND_MAX_USES_OPTION_NAME: "max_uses",
	INVITES_COMMAND_CREATE_SUB_COMMAND_MAX_USES_OPTION_DESCRIPTION:
		"The max uses of the invite you want to create, 0 for unlimited. (Defaults to 0)",

	INVITES_COMMAND_TRACK_SUB_COMMAND_NAME: "track",
	INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION: "Track an invite.",
	INVITES_COMMAND_TRACK_SUB_COMMAND_INVITE_OPTION_NAME: "invite",
	INVITES_COMMAND_TRACK_SUB_COMMAND_INVITE_OPTION_DESCRIPTION: "The invite you want to track.",
	INVITES_COMMAND_TRACK_SUB_COMMAND_NAME_OPTION_NAME: "name",
	INVITES_COMMAND_TRACK_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the invite you want to track.",
	INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION_OPTION_NAME: "description",
	INVITES_COMMAND_TRACK_SUB_COMMAND_DESCRIPTION_OPTION_DESCRIPTION: "The description of the invite you want to track.",

	INVITES_COMMAND_DELETE_SUB_COMMAND_NAME: "delete",
	INVITES_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION: "Delete an invite.",
	INVITES_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	INVITES_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the invite you want to delete.",

	INVITES_COMMAND_LIST_SUB_COMMAND_NAME: "list",
	INVITES_COMMAND_LIST_SUB_COMMAND_DESCRIPTION: "List all invites.",

	INVITES_COMMAND_INFO_SUB_COMMAND_NAME: "info",
	INVITES_COMMAND_INFO_SUB_COMMAND_DESCRIPTION: "Get information about an invite.",
	INVITES_COMMAND_INFO_SUB_COMMAND_NAME_OPTION_NAME: "name",
	INVITES_COMMAND_INFO_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the invite if we are already tracking it.",
	INVITES_COMMAND_INFO_SUB_COMMAND_INVITE_OPTION_NAME: "invite",
	INVITES_COMMAND_INFO_SUB_COMMAND_INVITE_OPTION_DESCRIPTION: "The invite you want to get information about.",

	INVITE_CREATED_TITLE: "Invite Created",
	INVITE_CREATED_DESCRIPTION: "An invite to {{channelMention}} has been created, the invite code is `{{inviteCode}}`!",

	INVALID_INVITE_TITLE: "Invalid Invite",
	INVALID_INVITE_DESCRIPTION: "The invite that you have provided is not valid!",

	INVITE_NOT_FOR_THIS_SERVER: "Invite Not For This Server",
	INVITE_NOT_FOR_THIS_SERVER_DESCRIPTION: "The invite that you have provided is not for this server!",

	INVITE_TRACKED_TITLE: "Tracking Invite",
	INVITE_TRACKED_DESCRIPTION: "I am now tracking the invite **{{inviteName}}** `[{{inviteCode}}]`!",

	INVITE_NOT_FOUND_TITLE: "Invite Not Found",
	INVITE_NOT_FOUND_DESCRIPTION: "An invite with a name of `{{inviteName}}` was not found!",

	INVITE_DELETED_TITLE: "Invite Deleted",
	INVITE_DELETED_DESCRIPTION: "The invite **{{inviteName}}** `[{{inviteCode}}]` has been deleted!",

	INVITES_LIST_TITLE: "Invites",
	INVITES_LIST_NO_INVITES_DESCRIPTION:
		"There are currently no invites for this server, add some by doing `/invites create`!",

	INVITES_INFO_TITLE: "Invite Information",

	INVITE_EXPIRED_TITLE: "Invite Expired",
	INVITE_EXPIRED_DESCRIPTION: "The invite you have provided has expired!",

	ESCALATE_TO_ZENDESK_TITLE: "Escalate To Zendesk",

	ESCALATED_TO_ZENDESK_TITLE: "Zendesk Escalation",
	ESCALATED_MESSAGE_TO_ZENDESK_DESCRIPTION:
		"We'd like to open a support ticket for this message. Please click the button below to get started.",
	ESCALATED_THREAD_TO_ZENDESK_DESCRIPTION:
		"We'd like to open a support ticket for this thread. Please click the button below to get started.",

	OPEN_ZENDESK_TICKET_BUTTON_LABEL: "Open Zendesk Ticket",

	ESCALATE_TO_ZENDESK_EMAIL_LABEL: "Runpod Email",
	ESCALATE_TO_ZENDESK_EMAIL_PLACEHOLDER: "help@runpod.io",

	ESCALATED_TO_ZENDESK_ERROR_TITLE: "Error Escalating To Zendesk",
	ESCALATED_TO_ZENDESK_ERROR_DESCRIPTION: "An error occurred while escalating to Zendesk, please try again later.",

	TICKET_CREATED_TITLE: "Ticket Created",
	TICKET_CREATED_DESCRIPTION: "Your ticket has been created, check your email for ticket #{{ticketId}}!",
	TICKET_CREATED_EMBED_DESCRIPTION: "A support ticket has been opened for this conversation. Ticket #{{ticketId}}.",

	ESCALATION_FOR_ANOTHER_USER_TITLE: "Escalation For Another User",
	ESCALATION_FOR_ANOTHER_USER_DESCRIPTION: "This escalation is for another user, you can't open this ticket!",

	TICKET_ALREADY_EXISTS_TITLE: "Ticket Already Exists",
	TICKET_ALREADY_EXISTS_DESCRIPTION:
		"You already have a ticket open (#{{ticketId}}), please wait for it to be resolved before opening a new one!",

	INVALID_LOG_EVENT_NAME_TITLE: "Invalid Log Event Name",
	INVALID_LOG_EVENT_NAME_DESCRIPTION: "The event name you provided is not a valid event name!",

	LOG_CHANNEL_ADDED_TITLE: "Log Channel Added",
	LOG_CHANNEL_ADDED_DESCRIPTION: "{{event}} will now be logged into {{channel}}!",

	LOG_CHANNEL_REMOVED_TITLE: "Log Channel Removed",
	LOG_CHANNEL_REMOVED_DESCRIPTION: "{{event}} will no longer be logged into {{channel}}!",

	TAG_COMMAND_NAME: "tag",
	TAG_COMMAND_DESCRIPTION: "Retrieve a tag by name or ID",

	TAG_COMMAND_NAME_OPTION_NAME: "name",
	TAG_COMMAND_NAME_OPTION_DESCRIPTION: "The name or ID of the tag to retrieve",

	TAGS_COMMAND_NAME: "tags",
	TAGS_COMMAND_DESCRIPTION: "Manage tags (create, edit, delete, list)",

	TAGS_COMMAND_CREATE_SUB_COMMAND_NAME: "create",
	TAGS_COMMAND_CREATE_SUB_COMMAND_DESCRIPTION: "Create a new tag",
	TAGS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	TAGS_COMMAND_CREATE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name of the tag",
	TAGS_COMMAND_CREATE_SUB_COMMAND_CONTENT_OPTION_NAME: "content",
	TAGS_COMMAND_CREATE_SUB_COMMAND_CONTENT_OPTION_DESCRIPTION: "The content of the tag",

	TAGS_COMMAND_LIST_SUB_COMMAND_NAME: "list",
	TAGS_COMMAND_LIST_SUB_COMMAND_DESCRIPTION: "List all available tags",

	TAGS_COMMAND_DELETE_SUB_COMMAND_NAME: "delete",
	TAGS_COMMAND_DELETE_SUB_COMMAND_DESCRIPTION: "Delete a tag",
	TAGS_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_NAME: "name",
	TAGS_COMMAND_DELETE_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name or ID of the tag to delete",

	TAGS_COMMAND_EDIT_SUB_COMMAND_NAME: "edit",
	TAGS_COMMAND_EDIT_SUB_COMMAND_DESCRIPTION: "Edit a tag's content",
	TAGS_COMMAND_EDIT_SUB_COMMAND_NAME_OPTION_NAME: "name",
	TAGS_COMMAND_EDIT_SUB_COMMAND_NAME_OPTION_DESCRIPTION: "The name or ID of the tag to edit",
	TAGS_COMMAND_EDIT_SUB_COMMAND_CONTENT_OPTION_NAME: "content",
	TAGS_COMMAND_EDIT_SUB_COMMAND_CONTENT_OPTION_DESCRIPTION: "The new content for the tag",

	TAG_NOT_FOUND_TITLE: "Tag Not Found",
	TAG_NOT_FOUND_DESCRIPTION: "A tag with a name of `{{tagName}}` was not found!",

	TAG_ALREADY_EXISTS_TITLE: "Tag Already Exists",
	TAG_ALREADY_EXISTS_DESCRIPTION: "A tag with the name `{{tagName}}` already exists!",

	TAG_CREATED_TITLE: "Tag Created",
	TAG_CREATED_DESCRIPTION: "The tag **{{tagName}}** has been created!",

	TAG_DELETED_TITLE: "Tag Deleted",
	TAG_DELETED_DESCRIPTION: "The tag **{{tagName}}** has been deleted!",

	TAG_UPDATED_TITLE: "Tag Updated",
	TAG_UPDATED_DESCRIPTION: "The tag **{{tagName}}** has been updated!",

	TAG_LIST_TITLE: "Tags",
	TAG_LIST_EMPTY_DESCRIPTION: "There are currently no tags, add some by doing `/tags create`!",

	RUNPOD_NOT_LINKED: "User does not have a Runpod account linked.",
	RUNPOD_HELP_US_HELP_YOU:
		"Help us help you! Please link your Runpod and Discord accounts so our team can assist you faster.",
	RUNPOD_ASK_TO_LINK_BUTTON_LABEL: "Ask them to link their account?",
	RUNPOD_LINK_ACCOUNT_BUTTON_LABEL: "Link Runpod Account",
	RUNPOD_FETCH_USER_FAILED: "Failed to fetch user data.",
	RUNPOD_FETCH_LINK_FAILED: "Failed to fetch the link.",

	// Mastra Q&A Messages
	MASTRA_THINKING_MESSAGE: "🤔 Processing your question...",
	MASTRA_GREETING_MESSAGE: "👋 Hi! Please ask a question and I'll help you!",
	MASTRA_ERROR_MESSAGE: "❌ An error occurred while processing your request. Please try again later.",
	MASTRA_BETA_FOOTER:
		"\n\n-# Powered by Runpod AI. This is a beta feature, if you need more help please post in a forum channel or [create a ticket](https://contact.runpod.io/hc/en-us/requests/new)",
};
