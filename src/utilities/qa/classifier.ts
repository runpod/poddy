import { processRunPodQuery } from "../runpod.js";
import { CLASSIFICATION_PROMPT, MESSAGES } from "./messages.js";

export async function analyzeQuestionType(fullText: string, hasThreadContext = false) {
	try {
		// Call Runpod with classification request using pass_through mode and GPT-3.5
		const result = await processRunPodQuery(
			CLASSIFICATION_PROMPT(fullText, hasThreadContext),
			false, // needsRAG = false (use pass_through mode)
			null, // threadContext
			null, // images
			"openai_3.5_turbo",
			0.1, // temperature
			100, // max_tokens
		);

		if (!result.success) {
			throw new Error(result.error || "Classification failed");
		}

		// Parse the JSON response
		const classification = JSON.parse(result.answer);

		console.log(
			`📊 Classification: RAG=${classification.needs_rag}, Clarity=${classification.clarity}, Complexity=${classification.complexity} - ${classification.reasoning}`,
		);

		return {
			needs_rag: classification.needs_rag !== false, // Default to true if not explicitly false
			clarity: classification.clarity || "clear",
			complexity: classification.complexity || "simple", // Default to simple if not provided
			missing_info: classification.clarity === "unclear" ? MESSAGES.CLARIFICATION_DEFAULT : [],
		};
	} catch (error: any) {
		console.error("Classification failed, defaulting to research mode:", error.message);
	}

	// Default fallback if classification fails - use RAG for safety
	return {
		needs_rag: true,
		clarity: "clear",
		complexity: "simple", // Default to simple model
		missing_info: [],
	};
}
