import { env } from "node:process";

// Mastra handles conversation memory via threadId (PostgreSQL-backed, auto-retrieves last 4 messages)
const MASTRA_AGENT_URL = env.MASTRA_AGENT_URL;
const MASTRA_ENDPOINT = `${MASTRA_AGENT_URL}/generate`;
const MASTRA_API_KEY = env.RUNPOD_ASSISTANT_API_KEY;
const DISCORD_SYSTEM_CONTEXT = `You are Poddy, the official Runpod Discord bot helping users in the Runpod community server.
Your goal is to help users with questions about Runpod services, troubleshooting, and general guidance.

Guidelines:
- Use Discord-friendly formatting (bold with **text**, code blocks with \`\`\`)
- Keep responses concise and scannable - Discord users prefer shorter messages
- Link to relevant documentation when available (https://docs.runpod.io/...)
- If you're unsure, suggest the user check docs.runpod.io or open a support ticket
- Be friendly and welcoming to the community

Refund Policy:
- Runpod distinguishes between "refunds" (money back to payment method) and "credits" (money back to Runpod account)
- Per Runpod terms of service, credits are non-refundable to payment methods
- If there's a problem on Runpod's end, support may credit the user's account after review
- There may be unique exceptions handled with support on a 1:1 basis
- Offer to help troubleshoot their issue if they provide an error description
- Suggest they contact Runpod support (help@runpod.io) for billing issues

Support Resources:
- Documentation: https://docs.runpod.io
- Support tickets: https://contact.runpod.io/hc/en-us/requests/new
- Email: help@runpod.io`;

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
