/**
 * Q&A Thread Database Functions
 * Handles storing Discord thread conversations to external PostgreSQL database
 */

import type { PrismaClient } from "@prisma/client";
import pkg from "pg";
import { CONTENT_FORMATTERS } from "./messages.js";

const { Pool } = pkg;

import { env } from "node:process";

// Create connection pool for QA threads database
const qaDbPool = new Pool({
	host: env.DB_HOST,
	user: env.DB_USERNAME,
	database: env.DB_NAME,
	password: env.DB_PASS,
	port: 5432,
	ssl: {
		rejectUnauthorized: false,
	},
});

/**
 * Create a new Q&A thread entry
 */
export async function createQAThread(_prisma: PrismaClient, threadId: string, source: string, question: string) {
	try {
		console.log(`📝 Creating Q&A thread: ${threadId}`);

		const content = CONTENT_FORMATTERS.INITIAL_USER(question);
		const now = new Date();

		const result = await qaDbPool.query(
			`INSERT INTO qa_threads (thread_id, source, question, content, created, last_updated)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (thread_id) DO NOTHING
             RETURNING id`,
			[threadId, source, question, content, now, now],
		);

		if (result.rowCount === 0) {
			console.log(`ℹ️ Thread ${threadId} already exists in database`);
			return null;
		}

		console.log(`✅ Created QA thread ${threadId} in external database`);
		return { id: result.rows[0].id, threadId };
	} catch (error: any) {
		console.error("Error creating Q&A thread:", error);
		throw error;
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
		const now = new Date();

		const result = await qaDbPool.query(
			`UPDATE qa_threads
             SET content = content || $1,
                 llm_used = $2,
                 category = COALESCE($3, category),
                 last_updated = $4
             WHERE thread_id = $5
             RETURNING id`,
			[newContent, llmUsed, category || null, now, threadId],
		);

		if (result.rowCount === 0) {
			console.error(`Thread ${threadId} not found for bot response update`);
			return null;
		}

		console.log(`✅ Updated thread ${threadId} with bot response`);
		return { id: result.rows[0].id };
	} catch (error: any) {
		console.error("Error adding bot response:", error);
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
		const now = new Date();

		const result = await qaDbPool.query(
			`UPDATE qa_threads
             SET content = content || $1,
                 last_updated = $2
             WHERE thread_id = $3
             RETURNING id`,
			[newContent, now, threadId],
		);

		if (result.rowCount === 0) {
			console.error(`Thread ${threadId} not found for user message update`);
			return null;
		}

		console.log(`✅ Updated thread ${threadId} with user message`);
		return { id: result.rows[0].id };
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
		const result = await qaDbPool.query(`SELECT id FROM qa_threads WHERE thread_id = $1 LIMIT 1`, [threadId]);

		return (result.rowCount ?? 0) > 0;
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
		const result = await qaDbPool.query(
			`SELECT content, category, llm_used, created, last_updated
             FROM qa_threads
             WHERE thread_id = $1`,
			[threadId],
		);

		if (result.rowCount === 0) {
			return null;
		}

		return result.rows[0];
	} catch (error: any) {
		console.error("Error getting thread content:", error);
		return null;
	}
}
