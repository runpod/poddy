/**
 * Mastra API Integration
 * Simple, direct call to Mastra agent - no polling, no classification complexity
 *
 * Mastra handles conversation memory via threadId (PostgreSQL-backed, auto-retrieves last 4 messages)
 */

import { DISCORD_SYSTEM_CONTEXT } from "./systemContext.js";

const MASTRA_ENDPOINT =
	process.env.MASTRA_ENDPOINT_URL ||
	"https://runpod-assistant.mastra.cloud/api/agents/runpodGeneralQuestionAgent/generate";
const MASTRA_API_KEY = process.env.MASTRA_API_KEY;

interface MastraResponse {
	text: string;
	sources?: Array<{
		title: string;
		url: string;
		score: number;
		source: string;
	}>;
	usage?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
	};
}

/**
 * Call Mastra API directly
 * @param question - The user's question
 * @param threadId - Discord thread ID for conversation continuity
 * @param resourceId - Guild/server ID for user isolation
 */
export async function callMastraAPI(
	question: string,
	threadId?: string,
	resourceId?: string,
): Promise<{ success: true; text: string; sources?: MastraResponse["sources"] } | { success: false; error: string }> {
	if (!MASTRA_API_KEY) {
		return {
			success: false,
			error: "Mastra API key not configured",
		};
	}

	try {

		const payload: {
			messages: Array<{ role: string; content: string }>;
			threadId?: string;
			resourceId?: string;
			source: string;
		} = {
			messages: [
				{ role: "system", content: DISCORD_SYSTEM_CONTEXT },
				{ role: "user", content: question },
			],
			source: "discord",
		};

		// Both threadId and resourceId required for memory
		if (threadId && resourceId) {
			payload.threadId = threadId;
			payload.resourceId = resourceId;
		}

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${MASTRA_API_KEY}`,
		};

		const response = await fetch(MASTRA_ENDPOINT, {
			method: "POST",
			headers,
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
			sources: data.sources,
		};
	} catch (error: any) {
		console.error("[Mastra] Error:", error.message);
		return {
			success: false,
			error: "Failed to get response. Please try again later.",
		};
	}
}
