declare global {
	namespace NodeJS {
		interface ProcessEnv {
			API_PORT: string;
			APPLICATION_ID: string;
			CHANGELOG_WEBHOOK_SECRET: string;
			CONSOLE_HOOK: string;
			DATABASE_URL: string;
			DATADOG_API_KEY: string;
			DEVELOPMENT_GUILD_ID: string;
			DISCORD_TOKEN: string;
			EXPORTER_ACCESS_KEY: string;
			EXPORTER_BUCKET_NAME: string;
			EXPORTER_FILE_PATH: string;
			EXPORTER_SECRET_KEY: string;
			GUILD_HOOK: string;
			MASTRA_AGENT_URL: string;
			NODE_ENV: "development" | "production";
			RUNPOD_API_KEY: string;
			RUNPOD_ASSISTANT_API_KEY: string;
			RUNPOD_DEV_API_KEY: string;
			SENTRY_DSN: string;
			ZENDESK_API_KEY: string;
		}
	}
}

export {};
