/**
 * Centralized Messages for Q&A System
 * All user-facing strings, prompts, and animation frames
 */

// Bot Identity & Context
export const BOT_CONTEXT = `You are a Runpod support assistant. Runpod is a GPU cloud service where people can rent GPUs as individual docker instances or scale with our serverless API platform. You are a knowledge and documentation bot - you CANNOT process refunds, access accounts, or take any actions on behalf of users.`;

export const LIMITATIONS_REMINDER = `Remember:
- You can only provide information and guidance
- You CANNOT process refunds or access user accounts
- You CANNOT take any actions on behalf of the user
- If asked about refunds, explain the user needs to contact support through official channels`;

// User-facing Messages
export const MESSAGES = {
	GREETING: "👋 Hi! Please ask a question and I'll help you!",
	CLARIFICATION_FALLBACK: "I'd like to help! Could you provide more details about what you're trying to do?",
	CLARIFICATION_DEFAULT: ["Please provide more details about your question"],
	ERROR_GENERIC: "❌ An error occurred while processing your request. Please try again later.",
	ERROR_FAILED_RESPONSE: "Failed to get response. Please try again later.",
	ERROR_FORMAT_FALLBACK: "I found some information but had trouble formatting it. Please try rephrasing your question.",
	BETA_FOOTER:
		"\n\n*This feature is still in beta and being improved. If you continue to need more help feel free to post in our community or [file a ticket](https://contact.runpod.io/hc/en-us/requests/new).*",
} as const;

// Animation Frames
export const ANIMATION_FRAMES = {
	CLARIFICATION: [
		"🤔 Let me understand what you need help with.",
		"🤔 Let me understand what you need help with..",
		"🤔 Let me understand what you need help with...",
		"💭 Thinking of the right questions.",
		"💭 Thinking of the right questions..",
		"💭 Thinking of the right questions...",
	],
	PROCESSING: [
		"🤔 Processing your question.",
		"🤔 Processing your question..",
		"🤔 Processing your question...",
		"🔍 Searching documentation.",
		"🔍 Searching documentation..",
		"🔍 Searching documentation...",
		"📚 Analyzing information.",
		"📚 Analyzing information..",
		"📚 Analyzing information...",
		"✨ Preparing response.",
		"✨ Preparing response..",
		"✨ Preparing response...",
	],
} as const;

// Initial Messages for Animations
export const INITIAL_MESSAGES = {
	CLARIFICATION_THINKING: "🤔 Let me understand what you need help with...",
	PROCESSING_THINKING: "🤔 Processing your question...",
} as const;

// Content Formatting
export const CONTENT_FORMATTERS = {
	USER_PREFIX: "\n\nUser: ",
	BOT_PREFIX: "\n\nBot: ",
	INITIAL_USER: (question: string) => `User: ${question}`,
	THREAD_IMAGES_CONTEXT: (count: number) =>
		`\n\n[Thread contains ${count} image(s) that may be relevant to this conversation]`,
} as const;

// Classification Prompt Template
export const CLASSIFICATION_PROMPT = (
	fullText: string,
	hasThreadContext: boolean,
) => `Analyze this support conversation and determine if additional documentation research is needed.

${hasThreadContext ? "This is a FOLLOW-UP in an existing conversation thread." : "This is a NEW conversation."}

Text to analyze:
"""
${fullText}
"""

Determine:
1. needs_rag: Should we search documentation for additional information?
2. clarity: Is the question clear enough to answer?
3. complexity: Is this complex requiring deep reasoning? ("simple" or "complex")
4. reasoning: Brief explanation

Guidelines for needs_rag:
- TRUE when: User asks about NEW topics, specific features, technical details, errors, pricing, policies, or anything requiring factual Runpod information
- FALSE when: User is thanking, asking to clarify/expand previous answer, general discussion, or question can be answered from conversation context alone
- When in doubt, choose TRUE to ensure accuracy

Guidelines for clarity:
- "clear" when: We understand what they're asking about
- "unclear" when: Question is too vague like "help", "how", "what", "error" without context

Guidelines for complexity (determines which model to use):
- "complex" when: Debugging multi-step issues, analyzing error logs/screenshots, architecture design, performance optimization, integration problems, or questions requiring deep technical reasoning
- "simple" when: Basic how-to questions, documentation lookups, simple troubleshooting, general info, thank you messages, or straightforward technical questions

Examples:
- "How do I SSH into my pod?" → needs_rag: true, clarity: clear, complexity: simple
- "thanks!" → needs_rag: false, clarity: clear, complexity: simple
- "My pod crashes with OOM errors, here's the log [screenshot]" → needs_rag: true, clarity: clear, complexity: complex
- "What's the pricing?" → needs_rag: true, clarity: clear, complexity: simple
- "Why does my distributed training fail intermittently?" → needs_rag: true, clarity: clear, complexity: complex
- "help" → needs_rag: false, clarity: unclear, complexity: simple
- "Can you analyze this architecture and suggest improvements?" → needs_rag: false, clarity: clear, complexity: complex

Respond in JSON:
{
  "needs_rag": true/false,
  "clarity": "clear|unclear",
  "complexity": "simple|complex",
  "reasoning": "brief explanation"
}`;

// Clarification Prompt Template
export const CLARIFICATION_PROMPT = (question: string, images: string[] | null) => `${BOT_CONTEXT}

A user asked a very vague question: "${question}"${images ? `\n[Thread contains ${images.length} image(s) that may provide context]` : ""}

Please ask 1-2 specific clarifying questions to help understand what they need help with regarding Runpod services. Keep it brief and friendly. Focus on understanding if they need help with:
- GPU pods/instances setup
- Serverless deployment
- Technical issues
- Billing questions (though you cannot process refunds)
- API usage
- Documentation

Do NOT offer to process refunds or take any actions. You can only provide information and guidance.`;

// Standard Query Prompt Templates
export const QUERY_PROMPTS = {
	RAG: (question: string, images: string[] | null) => `${BOT_CONTEXT}

Question: ${question}${images ? CONTENT_FORMATTERS.THREAD_IMAGES_CONTEXT(images.length) : ""}

Please provide a detailed, accurate answer based on Runpod's documentation and knowledge base. ${LIMITATIONS_REMINDER}`,

	PASSTHROUGH: (question: string, images: string[] | null) => `${BOT_CONTEXT}

Question: ${question}${images ? CONTENT_FORMATTERS.THREAD_IMAGES_CONTEXT(images.length) : ""}

Please provide a helpful response based on general knowledge about Runpod services. ${LIMITATIONS_REMINDER}`,
} as const;

// Thread Summary Prompt Templates
export const THREAD_SUMMARY_PROMPTS = {
	CUSTOM: (
		conversation: string,
		customPrompt: string,
	) => `Please summarize this Discord thread conversation with the following focus:

**Custom Instructions:** ${customPrompt}

Conversation:
${conversation}

Provide a clear, structured summary that addresses the custom instructions above.`,

	DEFAULT: (conversation: string) => `Please summarize this Discord thread conversation. Focus on:
1. The main topic or problem discussed
2. Key solutions or answers provided
3. Important technical details mentioned
4. Any actionable outcomes or decisions made

Conversation:
${conversation}

Provide a clear, structured summary in 3-5 paragraphs.`,
} as const;

// Bot Safety - Action Phrases to Detect
export const BOT_ACTION_PHRASES = [
	"i will process",
	"i can refund",
	"i'll refund",
	"i am refunding",
	"i will refund",
	"let me process",
	"i'll process",
	"i can process",
	"i will handle",
	"i'll handle",
	"i can handle",
	"processing your",
	"initiating",
	"has been initiated",
	"i can access",
	"i'll access",
	"let me check your account",
	"looking at your account",
] as const;

// Constants
export const CONSTANTS = {
	IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
	MAX_MESSAGE_LENGTH: 2000,
	MAX_IMAGES_PER_THREAD: 5,
	IMAGE_TIMEOUT_MS: 10000,
	ANIMATION_INTERVALS: {
		CLARIFICATION: 1000,
		PROCESSING: 1500,
	},
} as const;
