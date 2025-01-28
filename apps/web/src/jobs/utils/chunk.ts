import { estimateTokensForContent } from "./tokeniser";

export function calculateChunkSize(
  content: Array<{ key: string; sourceText: string }>,
  model: string,
) {
  const MAX_INPUT_TOKENS = 128000;
  const MIN_CHUNK_SIZE = 1;
  const MAX_CHUNK_SIZE = 100;

  if (content.length === 0) {
    return MIN_CHUNK_SIZE;
  }

  const estimatedTokens = estimateTokensForContent(content, model);

  // Calculate how many items we can fit in a chunk based on input token limit
  const itemsPerChunk = Math.min(
    MAX_CHUNK_SIZE,
    Math.max(
      MIN_CHUNK_SIZE,
      Math.floor((MAX_INPUT_TOKENS / estimatedTokens) * content.length),
    ),
  );

  return itemsPerChunk;
}
