import { QUERY_PROMPTS, BOT_ACTION_PHRASES } from './qa/messages.js';

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || 'gwh845jre9mwox';
const RUNPOD_ENDPOINT = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`;
const RUNPOD_INGESTION_ENDPOINT = process.env.RUNPOD_INGESTION_ENDPOINT || 'https://api.runpod.ai/v2/t2dx8r4x8b2m5l/run';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150; // 5 minutes (150 * 2 seconds = 300 seconds)

/**
 * Call Runpod API to start a job
 */
async function callRunPodAPI(prompt: string, needsRAG = true, threadContext: string | null = null, images: string[] | null = null, llmProvider = 'openai_4o_mini', temperature = 0.3, maxTokens?: number) {
    try {
        const payload: any = {
            input: {
                prompt: prompt,
                llm_provider: llmProvider,
                temperature: temperature,
                max_tokens: maxTokens || (llmProvider === 'openai_4o' ? 2000 : 1500)  // Use provided tokens or default based on model
            }
        };

        // Add context if provided
        if (threadContext) {
            payload.input.context = threadContext;
        }

        // Add images if provided (for vision models)
        if (images && images.length > 0) {
            // If single image, pass as string; if multiple, pass as array
            payload.input.image_paths = images.length === 1 ? images[0] : images;
        }

        // Configure based on whether we need RAG or not
        if (needsRAG) {
            // Need documentation search - use RAG
            payload.input.collections = ['github_docs', 'discord'];
            payload.input.skip_decomposition = false;  // Enable decomposition for better search
            payload.input.skip_summarization = false;  // Enable summarization for better context
            payload.input.top_k_rerank = 5;  // Get more documents for comprehensive answers
        } else {
            // No documentation needed - use pass_through
            payload.input.pass_through = true;  // Note: pass_through with underscore
            // Context is still passed for conversation continuity
        }

        const response = await fetch(RUNPOD_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RUNPOD_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Runpod API Error:', error.message);
        throw error;
    }
}

/**
 * Check job status for any endpoint
 */
async function checkJobStatus(endpointId: string, jobId: string) {
    const response = await fetch(
        `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`,
        {
            headers: {
                'Authorization': `Bearer ${RUNPOD_API_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Wait for job completion with configurable endpoint
 */
async function waitForJobCompletion(endpointId: string, jobId: string) {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
        attempts++;

        try {
            const jobStatus = await checkJobStatus(endpointId, jobId);

            if (jobStatus.status === 'COMPLETED') {
                return { success: true, data: jobStatus };
            }

            if (['FAILED', 'CANCELLED', 'TIMED_OUT'].includes(jobStatus.status)) {
                return { success: false, status: jobStatus.status, error: jobStatus.error };
            }
        } catch (error: any) {
            return { success: false, status: 'ERROR', error: error.message };
        }
    }

    return { success: false, status: 'TIMEOUT' };
}

/**
 * Process a Runpod query and return response
 */
async function processRunPodQuery(prompt: string, needsRAG = true, threadContext: string | null = null, images: string[] | null = null, llmProvider = 'openai_4o_mini', temperature = 0.3, maxTokens?: number) {
    try {
        const jobResponse = await callRunPodAPI(prompt, needsRAG, threadContext, images, llmProvider, temperature, maxTokens);
        const jobId = jobResponse.id;

        const result = await waitForJobCompletion(RUNPOD_ENDPOINT_ID, jobId);

        if (!result.success) {
            return {
                success: false,
                error: result.status === 'TIMEOUT'
                    ? 'Request timed out. Please try again later.'
                    : `Job ${result.status.toLowerCase()}. Please try again.`
            };
        }

        const answer = result.data.output?.answer || result.data.output || 'No answer received';
        const metadata = result.data.output?.metadata || {};

        return {
            success: true,
            answer,
            metadata,
            jobId
        };

    } catch (error: any) {
        console.error('Runpod processing error:', error);
        return {
            success: false,
            error: 'Failed to process request. Please try again later.'
        };
    }
}

/**
 * Ensure response doesn't claim bot can take actions
 */
function ensureSafeResponse(answer: string) {
    const lowerAnswer = answer.toLowerCase();
    const hasActionClaim = BOT_ACTION_PHRASES.some(phrase => lowerAnswer.includes(phrase));

    if (hasActionClaim) {
        console.warn('Bot attempted to claim action capability');
    }

    return answer;
}

/**
 * Handle response with RAG (documentation search)
 */
async function handleRAGResponse(question: string, threadContext: string | null, images: string[] | null = null, useComplex = false) {
	const llmProvider = useComplex ? 'openai_4o' : 'openai_4o_mini';
	const response = await processRunPodQuery(
		QUERY_PROMPTS.RAG(question, images), 
		true, 
		threadContext, 
		images, 
		llmProvider
	);

	if (response.success) {
		response.answer = ensureSafeResponse(response.answer);
	}

	return { ...response, type: 'rag' };
}

/**
 * Handle response without RAG (passthrough with context)
 */
async function handlePassthroughResponse(question: string, threadContext: string | null, images: string[] | null = null, useComplex = false) {
	const llmProvider = useComplex ? 'openai_4o' : 'openai_4o_mini';
	const response = await processRunPodQuery(
		QUERY_PROMPTS.PASSTHROUGH(question, images), 
		false, 
		threadContext, 
		images, 
		llmProvider
	);

	if (response.success) {
		response.answer = ensureSafeResponse(response.answer);
	}

	return { ...response, type: 'passthrough' };
}

/**
 * Submit document to Runpod for ingestion into knowledge base
 */
async function ingestDocument(document: any): Promise<boolean> {
	try {
		if (!RUNPOD_API_KEY) {
			console.error('RUNPOD_API_KEY not configured');
			return false;
		}

		// Format the conversation as a readable document
		const formattedConversation = document.full_conversation
			.map((msg: any) => {
				const timestamp = new Date(msg.timestamp).toLocaleString();
				const authorLabel = msg.author.bot
					? `${msg.author.username} (Bot)`
					: msg.author.username;
				return `[${timestamp}] ${authorLabel}: ${msg.content}`;
			})
			.join('\n\n');

		// Create combined document content in markdown format
		const documentContent = `# ${document.title}

## Thread Information
- **Guild**: ${document.guild_name}
- **Channel**: ${document.parent_channel} → ${document.channel_name}
- **Created**: ${new Date(document.created_at).toLocaleString()}
- **Saved**: ${new Date(document.saved_at).toLocaleString()}
- **Saved By**: ${document.saved_by.username}
- **Messages**: ${document.message_count}
- **Participants**: ${document.participants.join(', ')}
- **Thread URL**: ${document.thread_url}
${document.tags.length > 0 ? `- **Tags**: ${document.tags.join(', ')}` : ''}

## Summary
${document.summary}

## Full Conversation
${formattedConversation}`;

		// Create simplified request payload matching documentation
		const payload = {
			input: {
				action: 'ingest_json',
				documents: {
					content: documentContent,
					filename: `discord_thread_${document.thread_id}.md`,
					source: document.thread_url,
					title: document.title,
					author: document.saved_by.username,
					category: 'discord_thread',
					tags: ['discord', 'thread', document.guild_name.toLowerCase()]
				},
				collection: 'discord',
				chunk_documents: false
			}
		};

		const response = await fetch(RUNPOD_INGESTION_ENDPOINT, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${RUNPOD_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		const responseData = await response.json();

		if (responseData.id) {
			const urlParts = RUNPOD_INGESTION_ENDPOINT.split('/');
			const ingestionEndpointId = urlParts[4] || urlParts[urlParts.length - 2];
			
			if (!ingestionEndpointId) {
				console.error('Could not extract endpoint ID from ingestion URL');
				return false;
			}
			
			const result = await waitForJobCompletion(ingestionEndpointId, responseData.id);
			
			if (result.success) {
				return true;
			}
			
			console.error(`Ingestion job failed: ${result.status}`);
			return false;
		}
		
		if (responseData.success || responseData.documents_uploaded) {
			return true;
		}

		console.error('Unexpected response from ingestion endpoint');
		return false;
	} catch (error: any) {
		console.error('Error submitting to Runpod:', error.message);
		return false;
	}
}

export {
    processRunPodQuery,
    ensureSafeResponse,
    handleRAGResponse,
    handlePassthroughResponse,
    ingestDocument
};