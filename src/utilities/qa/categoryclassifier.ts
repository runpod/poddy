/**
 * Intelligent Category Classifier
 * Uses GPT-3.5-turbo through Runpod to classify questions into categories
 */

import { waitForJobCompletion } from "../runpod.js";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || "gwh845jre9mwox";

const VALID_CATEGORIES = [
	"BILLING",
	"TECHNICAL",
	"SETUP",
	"GPU",
	"API",
	"SERVERLESS",
	"PODS",
	"DOCUMENTATION",
	"GENERAL",
] as const;

const CLASSIFICATION_PROMPT = (question: string) => `Classify this Runpod support question into ONE of these categories:

Question: "${question}"

Categories:
- BILLING: Payments, invoices, charges, credits, refunds, subscriptions, pricing, costs
- TECHNICAL: Errors, bugs, issues, problems, crashes, debugging, troubleshooting
- SETUP: Installation, configuration, initialization, getting started, deployment
- GPU: GPU-related, CUDA, VRAM, specific GPU models (RTX, A100, H100), GPU performance
- API: API usage, endpoints, requests, responses, webhooks, integrations
- SERVERLESS: Serverless functions, scaling, cold starts, serverless-specific features
- PODS: Pod management, containers, instances, machines, VMs, pod configuration
- DOCUMENTATION: Documentation requests, guides, tutorials, examples, how-to questions
- GENERAL: Anything that doesn't fit the above categories

Respond with ONLY the category name (e.g., "BILLING" or "TECHNICAL"). No explanation needed.`;

/**
 * Classify question into a category using GPT-3.5
 */
export async function classifyQuestionCategory(question: string): Promise<string> {
	try {
		const response = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${RUNPOD_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input: {
					prompt: CLASSIFICATION_PROMPT(question),
					pass_through: true,
					llm_provider: "openai_3.5_turbo",
					temperature: 0,
					max_tokens: 10,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const data = await response.json();
		const result = await waitForJobCompletion(RUNPOD_ENDPOINT_ID, data.id);

		if (result.success) {
			const answer = result.data.output?.answer || result.data.output || "";
			const category = answer.trim().toUpperCase();

			if (VALID_CATEGORIES.includes(category as any)) {
				return category;
			}

			console.warn(`Invalid category returned: ${category}, defaulting to GENERAL`);
		}
	} catch (error: any) {
		console.error("Category classification failed:", error.message);
	}

	return "GENERAL";
}
