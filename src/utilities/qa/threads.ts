/**
 * Q&A Thread Database Functions
 * Handles storing Discord thread conversations to external PostgreSQL database using Prisma
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaClient as QAPrismaClient } from "qa-client";
import { CONTENT_FORMATTERS } from "./messages.js";

// Create singleton QA Prisma client
const qaClient = new QAPrismaClient();

// Test connection on startup
qaClient.$queryRaw`SELECT 1`
	.then(() => console.log("✅ QA database connection established"))
	.catch((err: Error) => console.error("❌ QA database connection failed:", err.message));

/**
 * Create a new Q&A thread entry
 */
export async function createQAThread(_prisma: PrismaClient, threadId: string, source: string, question: string) {
	try {
		console.log(`📝 Creating Q&A thread: ${threadId}`);

		const content = CONTENT_FORMATTERS.INITIAL_USER(question);

		const thread = await qaClient.qAThread.create({
			data: {
				threadId,
				source,
				question,
				content,
			},
		});

		console.log(`✅ Created QA thread ${threadId} in external database with ID: ${thread.id}`);
		return { id: thread.id, threadId: thread.threadId };
	} catch (error: any) {
		// If thread already exists (unique constraint), just log and continue
		if (error.code === "P2002") {
			console.log(`ℹ️ Thread ${threadId} already exists in database`);
			return null;
		}
		console.error(`❌ Error creating Q&A thread ${threadId}:`, error.message);
		console.error("Full error:", error);
		return null; // Don't throw - allow bot to continue even if DB fails
	}
}

/**
 * Update thread with bot response and set category
 */
export async function addBotResponse(
	_prisma: PrismaClient,
	threadId: string,
	response: string,
	llmUsed: string,
	category?: string,
) {
	try {
		console.log(`🤖 Adding bot response to thread: ${threadId}`);

		const newContent = CONTENT_FORMATTERS.BOT_PREFIX + response;

		// Get current content first
		const currentThread = await qaClient.qAThread.findUnique({
			where: { threadId },
			select: { content: true },
		});

		if (!currentThread) {
			console.error(`❌ Thread ${threadId} not found for bot response update. Thread may not have been created yet.`);
			return null;
		}

		const thread = await qaClient.qAThread.update({
			where: { threadId },
			data: {
				content: currentThread.content + newContent,
				llmUsed,
				...(category && { category }), // Only update category if provided
			},
		});

		console.log(`✅ Updated thread ${threadId} with bot response (ID: ${thread.id}, category: ${category || "none"})`);
		return { id: thread.id };
	} catch (error: any) {
		console.error(`❌ Error adding bot response to thread ${threadId}:`, error.message);
		console.error("Full error:", error);
		return null;
	}
}

/**
 * Add user message to thread
 */
export async function addUserMessage(_prisma: PrismaClient, threadId: string, message: string) {
	try {
		console.log(`💬 Adding user message to thread: ${threadId}`);

		const newContent = CONTENT_FORMATTERS.USER_PREFIX + message;

		// Get current content first
		const currentThread = await qaClient.qAThread.findUnique({
			where: { threadId },
			select: { content: true },
		});

		if (!currentThread) {
			console.error(`Thread ${threadId} not found for user message update`);
			return null;
		}

		const thread = await qaClient.qAThread.update({
			where: { threadId },
			data: {
				content: currentThread.content + newContent,
			},
		});

		console.log(`✅ Updated thread ${threadId} with user message`);
		return { id: thread.id };
	} catch (error: any) {
		console.error("Error adding user message:", error);
		return null;
	}
}

/**
 * Check if thread exists
 */
export async function threadExists(_prisma: PrismaClient, threadId: string): Promise<boolean> {
	try {
		const thread = await qaClient.qAThread.findUnique({
			where: { threadId },
			select: { id: true },
		});

		return thread !== null;
	} catch (error: any) {
		console.error("Error checking thread existence:", error);
		return false;
	}
}

/**
 * Get thread content for context
 */
export async function getThreadContent(_prisma: PrismaClient, threadId: string) {
	try {
		const thread = await qaClient.qAThread.findUnique({
			where: { threadId },
			select: {
				content: true,
				category: true,
				llmUsed: true,
				created: true,
				lastUpdated: true,
			},
		});

		return thread;
	} catch (error: any) {
		console.error("Error getting thread content:", error);
		return null;
	}
}
