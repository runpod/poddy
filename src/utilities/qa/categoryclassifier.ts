/**
 * Intelligent Category Classifier
 * Uses GPT-3.5-turbo through RunPod to classify questions into categories
 */

import { env } from "node:process";
import axios from "axios";

/**
 * Classify question into a category using GPT-3.5
 */
export async function classifyQuestionCategory(question: string): Promise<string> {
	const classificationPrompt = `Classify this RunPod support question into ONE of these categories:

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

	try {
		const RUNPOD_API_KEY = env.RUNPOD_API_KEY;
		const RUNPOD_ENDPOINT_ID = env.RUNPOD_ENDPOINT_ID || "gwh845jre9mwox";

		// Call RunPod with classification request
		const classificationPayload = {
			prompt: classificationPrompt,
			pass_through: true, // Direct LLM call
			llm_provider: "openai_3.5_turbo", // Fast classification
			temperature: 0, // Zero temperature for consistent classification
			max_tokens: 10, // Just need the category name
		};

		const apiResponse = await axios.post(
			`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`,
			{ input: classificationPayload },
			{
				headers: {
					Authorization: `Bearer ${RUNPOD_API_KEY}`,
					"Content-Type": "application/json",
				},
				timeout: 30000,
			},
		);

		// Wait for job completion
		const jobId = apiResponse.data.id;
		let attempts = 0;
		const maxAttempts = 20; // 10 seconds max for classification

		while (attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			attempts++;

			const statusResponse = await axios.get(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/${jobId}`, {
				headers: {
					Authorization: `Bearer ${RUNPOD_API_KEY}`,
				},
			});

			if (statusResponse.data.status === "COMPLETED") {
				const answer = statusResponse.data.output?.answer || statusResponse.data.output || "";
				const category = answer.trim().toUpperCase();

				// Validate it's a valid category
				const validCategories = [
					"BILLING",
					"TECHNICAL",
					"SETUP",
					"GPU",
					"API",
					"SERVERLESS",
					"PODS",
					"DOCUMENTATION",
					"GENERAL",
				];

				if (validCategories.includes(category)) {
					console.log(`🏷️ Category classified as: ${category}`);
					return category;
				}

				console.warn(`Invalid category returned: ${category}, defaulting to GENERAL`);
				return "GENERAL";
			}

			if (["FAILED", "CANCELLED", "TIMED_OUT"].includes(statusResponse.data.status)) {
				console.error("Category classification job failed:", statusResponse.data.status);
				break;
			}
		}
	} catch (error: any) {
		console.error("Category classification failed, defaulting to GENERAL:", error.message);
	}

	// Default fallback
	return "GENERAL";
}
