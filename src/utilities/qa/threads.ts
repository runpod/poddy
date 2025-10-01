/**
 * Q&A Thread Database Functions
 * Handles storing Discord thread conversations using Prisma
 */

import type { PrismaClient } from '@prisma/client';
import { CONTENT_FORMATTERS } from './messages.js';

/**
 * Create a new Q&A thread entry
 */
export async function createQAThread(prisma: PrismaClient, threadId: string, source: string, question: string) {
    try {
        console.log(`📝 Creating Q&A thread: ${threadId}`);

        // Create thread without classification to avoid delays
        // Classification can be done async or on first response
        const thread = await prisma.qAThread.create({
            data: {
                threadId,
                source,
                question,
                content: CONTENT_FORMATTERS.INITIAL_USER(question)
            }
        });

        return thread;
    } catch (error: any) {
        // If thread already exists (unique constraint), just log and continue
        if (error.code === 'P2002') {
            console.log(`ℹ️ Thread ${threadId} already exists in database`);
            return null;
        }
        console.error('Error creating Q&A thread:', error);
        throw error;
    }
}

/**
 * Update thread with bot response
 */
export async function addBotResponse(prisma: PrismaClient, threadId: string, response: string, llmUsed: string) {
    try {
        console.log(`🤖 Adding bot response to thread: ${threadId}`);

        // Get current content first
        const currentThread = await prisma.qAThread.findUnique({
            where: { threadId },
            select: { content: true }
        });

        const thread = await prisma.qAThread.update({
            where: {
                threadId
            },
            data: {
                content: (currentThread?.content || '') + CONTENT_FORMATTERS.BOT_PREFIX + response,
                llmUsed
            }
        });

        return thread;
    } catch (error: any) {
        console.error('Error adding bot response:', error);
        return null;
    }
}

/**
 * Add user message to thread
 */
export async function addUserMessage(prisma: PrismaClient, threadId: string, message: string) {
    try {
        console.log(`💬 Adding user message to thread: ${threadId}`);

        // Get current content first
        const currentThread = await prisma.qAThread.findUnique({
            where: { threadId },
            select: { content: true }
        });

        const thread = await prisma.qAThread.update({
            where: {
                threadId
            },
            data: {
                content: (currentThread?.content || '') + CONTENT_FORMATTERS.USER_PREFIX + message
            }
        });

        return thread;
    } catch (error: any) {
        console.error('Error adding user message:', error);
        return null;
    }
}

/**
 * Check if thread exists
 */
export async function threadExists(prisma: PrismaClient, threadId: string): Promise<boolean> {
    try {
        const thread = await prisma.qAThread.findUnique({
            where: {
                threadId
            },
            select: {
                threadId: true
            }
        });

        return thread !== null;
    } catch (error: any) {
        console.error('Error checking thread existence:', error);
        return false;
    }
}

/**
 * Get thread content for context
 */
export async function getThreadContent(prisma: PrismaClient, threadId: string) {
    try {
        const thread = await prisma.qAThread.findUnique({
            where: {
                threadId
            },
            select: {
                content: true,
                category: true,
                llmUsed: true,
                created: true,
                lastUpdated: true
            }
        });

        return thread;
    } catch (error: any) {
        console.error('Error getting thread content:', error);
        return null;
    }
}
