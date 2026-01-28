import { env } from "node:process";
import { DISCORD_SYSTEM_CONTEXT } from "./systemContext.js";

// Mastra handles conversation memory via threadId (PostgreSQL-backed, auto-retrieves last 4 messages)
const MASTRA_ENDPOINT =
	env.MASTRA_ENDPOINT_URL || "https://runpod-assistant.mastra.cloud/api/agents/runpodGeneralQuestionAgent/generate";
const MASTRA_API_KEY = env.RUNPOD_ASSISTANT_API_KEY;

interface MastraSource {
	title: string;
	url: string;
	score: number;
	source: string;
}

interface MastraResponse {
	text: string;
	sources?: MastraSource[];
	usage?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	};
}

interface MastraPayload {
	messages: Array<{ role: string; content: string }>;
	threadId?: string;
	resourceId?: string;
	source: string;
}

type MastraResult = { success: true; text: string; sources?: MastraSource[] } | { success: false; error: string };

export async function callMastraAPI(question: string, threadId?: string, resourceId?: string): Promise<MastraResult> {
	if (!MASTRA_API_KEY) {
		// Should never reach here - caller should check API key availability
		// RUNPOD_ASSISTANT_API_KEY environment variable must be set
		return { success: false, error: "" }; // Empty error = silent
	}

	try {
		const payload: MastraPayload = {
			messages: [
				{ role: "system", content: DISCORD_SYSTEM_CONTEXT },
				{ role: "user", content: question },
			],
			source: "discord",
			// Both threadId and resourceId required for memory
			...(threadId && resourceId ? { threadId, resourceId } : {}),
		};

		const response = await fetch(MASTRA_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${MASTRA_API_KEY}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[Mastra] API error:", response.status, errorText);
			return {
				success: false,
				error: `API request failed: ${response.status}`,
			};
		}

		const data: MastraResponse = await response.json();

		return {
			success: true,
			text: data.text,
			...(data.sources && { sources: data.sources }),
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("[Mastra] Error:", message);
		return {
			success: false,
			error: "Failed to get response. Please try again later.",
		};
	}
}
