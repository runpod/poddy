/**
 * Image Processor Helper
 * Handles image detection and encoding for Discord messages
 */

import type { APIMessage } from "@discordjs/core";
import { CONSTANTS } from "./messages.js";

/**
 * Process message attachments and extract images
 * @param {APIMessage} message - Discord message object
 * @returns {Array|null} Array of base64 encoded images or null if no images
 */
async function extractImagesFromMessage(message: APIMessage): Promise<string[] | null> {
	if (!message.attachments || message.attachments.length === 0) {
		return null;
	}

	const images = [];

	for (const attachment of message.attachments) {
		// Check if attachment is an image
		const isImage = CONSTANTS.IMAGE_EXTENSIONS.some(
			(ext) => attachment.filename.toLowerCase().endsWith(ext) || attachment.content_type?.startsWith("image/"),
		);

		if (isImage) {
			console.log(`🖼️ Processing image: ${attachment.filename}`);
			try {
				const base64Image = await downloadAndEncodeImage(attachment.url);
				if (base64Image) {
					images.push(base64Image);
				}
			} catch (error: any) {
				console.error(`Failed to process image ${attachment.filename}:`, error.message);
			}
		}
	}

	return images.length > 0 ? images : null;
}

/**
 * Download image from URL and encode to base64
 * @param {string} url - Image URL
 * @returns {string|null} Base64 encoded image with data URI prefix
 */
async function downloadAndEncodeImage(url: string): Promise<string | null> {
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(CONSTANTS.IMAGE_TIMEOUT_MS),
		});

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		// Get content type from response headers
		const contentType = response.headers.get("content-type") || "image/png";

		// Get the image data as ArrayBuffer
		const arrayBuffer = await response.arrayBuffer();

		// Convert to base64
		const base64 = Buffer.from(arrayBuffer).toString("base64");

		// Return as data URI
		return `data:${contentType};base64,${base64}`;
	} catch (error: any) {
		console.error("Error downloading image:", error.message);
		return null;
	}
}

/**
 * Check if a message contains images
 * @param {APIMessage} message - Discord message object
 * @returns {boolean} True if message has image attachments
 */
function messageHasImages(message: APIMessage): boolean {
	if (!message.attachments || message.attachments.length === 0) {
		return false;
	}

	return message.attachments.some((attachment) => {
		return CONSTANTS.IMAGE_EXTENSIONS.some(
			(ext) => attachment.filename.toLowerCase().endsWith(ext) || attachment.content_type?.startsWith("image/"),
		);
	});
}

/**
 * Extract all images from a thread's message history
 * @param {any} apiClient - Discord REST API client
 * @param {string} threadId - Discord thread ID
 * @param {number} limit - Maximum number of recent messages to check (default 20)
 * @returns {Array|null} Array of base64 encoded images or null if no images
 */
async function extractImagesFromThread(apiClient: any, threadId: string, limit = 20): Promise<string[] | null> {
	try {
		// Fetch recent messages from the thread using Discord REST API
		const messages = await apiClient.channels.getMessages(threadId, { limit });
		const allImages = [];

		// Sort messages by timestamp (oldest first)
		const sortedMessages = messages.sort((a: any, b: any) => {
			const aTime = new Date(a.timestamp).getTime();
			const bTime = new Date(b.timestamp).getTime();
			return aTime - bTime;
		});

		for (const message of sortedMessages) {
			const images = await extractImagesFromMessage(message as APIMessage);
			if (images) {
				console.log(
					`🖼️ Found ${images.length} image(s) from ${message.author?.username || "Unknown"} at ${new Date(message.timestamp).toLocaleTimeString()}`,
				);
				allImages.push(...images);
			}
		}

		if (allImages.length > 0) {
			console.log(`📸 Total images found in thread: ${allImages.length}`);
			// Limit to most recent images to avoid token limits
			if (allImages.length > CONSTANTS.MAX_IMAGES_PER_THREAD) {
				console.log(`⚠️ Limiting to last ${CONSTANTS.MAX_IMAGES_PER_THREAD} images (found ${allImages.length})`);
				return allImages.slice(-CONSTANTS.MAX_IMAGES_PER_THREAD);
			}
			return allImages;
		}

		return null;
	} catch (error) {
		console.error("Error extracting images from thread:", error);
		return null;
	}
}

export { extractImagesFromMessage, extractImagesFromThread, downloadAndEncodeImage, messageHasImages };
