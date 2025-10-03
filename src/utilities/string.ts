export function splitMessage(text: string, maxLength = 2000) {
	const chunks = [];
	let currentChunk = "";

	const lines = text.split("\n");
	for (const line of lines) {
		if (currentChunk.length + line.length + 1 > maxLength) {
			chunks.push(currentChunk);
			currentChunk = line;
		} else {
			currentChunk += (currentChunk ? "\n" : "") + line;
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk);
	}

	return chunks;
}
