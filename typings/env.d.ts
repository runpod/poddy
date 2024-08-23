declare global {
	namespace NodeJS {
		interface ProcessEnv {
			API_PORT: string;
			APPLICATION_ID: string;
			CLIENT_SECRET: string;
			CONSOLE_HOOK: string;
			DATABASE_URL: string;
			DATADOG_API_KEY: string;
			DEVELOPMENT_GUILD_ID: string;
			DISCORD_TOKEN: string;
			GUILD_HOOK: string;
			LAMBDA_PUSH_SECRET: string;
			NODE_ENV: "development" | "production";
			RUNPOD_API_KEY: string;
			SENTRY_DSN: string;
			SLACK_CUSTOMER_SUCCESS_HOOK: string;
			SLACK_SALES_HOOK: string;
			ZENDESK_API_KEY: string;
		}
	}
}

export {};
