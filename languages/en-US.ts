export default {
	LANGUAGE_ENABLED: true,
	LANGUAGE_ID: "en-US",
	LANGUAGE_NAME: "English, US",

	PARSE_REGEX:
		// eslint-disable-next-line unicorn/no-unsafe-regex, prefer-named-capture-group
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
	ManageGuildExpressions: "Manage Expressions",
	ManageEmojisAndStickers: "Manage Emojis and Stickers",
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
	UseExternalSounds: "Use External Sounds",
	SendVoiceMessages: "Send Voice Messages",

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
	PING_COMMAND_DESCRIPTION: "Pong! Get the current ping / latency of the Nimbus.",

	PING: "Ping?",
	PONG: "Pong! (Host latency of {{hostLatency}}ms)",

	CONFIG_COMMAND_NAME: "config",
	CONFIG_COMMAND_DESCRIPTION: "Manage Nimbus' config for your server.",

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
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_CHANNEL_OPTION_DESCRIPTION:
		"The forum channel to remove an auto tag from.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_REMOVE_SUB_COMMAND_TAG_OPTION_DESCRIPTION:
		"The tag to remove from the forum channel.",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_NAME: "list",
	CONFIG_AUTO_TAG_ON_FORUM_CHANNEL_SUB_COMMAND_GROUP_LIST_SUB_COMMAND_DESCRIPTION:
		"List all auto tag on forum channels.",

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
};
