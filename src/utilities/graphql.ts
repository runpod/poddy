import { env } from "node:process";

export const RUNPOD_GRAPHQL_ENDPOINT =
	env.NODE_ENV === "development" ? "https://api.runpod.dev/graphql" : "https://api.runpod.io/graphql";

export const RUNPOD_API_KEY = env.NODE_ENV === "development" ? env.RUNPOD_DEV_API_KEY : env.RUNPOD_API_KEY;

export const DISCORD_LOGIN_URL_QUERY = "query discordLoginUrl {\n  discordLoginUrl\n}";

export const USER_BY_DISCORD_ID_QUERY =
	"query userByDiscordId($input: UserByDiscordIdInput) {\n  userByDiscordId(input: $input) {\n    id\n    email\n    pods {\n      id\n      desiredStatus\n    }\n    endpoints {\n      id\n    }\n  }\n}";

interface GraphQLError {
	message: string;
	locations?: Array<{ line: number; column: number }>;
	path?: Array<string | number>;
	extensions?: Record<string, any>;
}

interface GraphQLResponse<T> {
	data?: T;
	errors?: GraphQLError[];
}

interface RunpodPod {
	id: string;
	desiredStatus: string;
}

interface RunpodEndpoint {
	id: string;
}

interface RunpodUser {
	id: string;
	email: string;
	pods: RunpodPod[];
	endpoints: RunpodEndpoint[];
}

export type UserByDiscordIdResult = GraphQLResponse<{ userByDiscordId: RunpodUser | null }>;

export async function query<T = any>(query: string, variables?: Record<string, any>): Promise<GraphQLResponse<T>> {
	const response = await fetch(RUNPOD_GRAPHQL_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			Authorization: `Bearer ${RUNPOD_API_KEY}`,
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	if (!response.ok) {
		throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<GraphQLResponse<T>>;
}
