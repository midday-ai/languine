export function calculateChunkSize(
  content: Array<{ key: string; sourceText: string }>,
) {
  const MAX_INPUT_TOKENS = 128000;
  const AVERAGE_CHARS_PER_TOKEN = 4;

  const totalChars = content.reduce(
    (sum, item) => sum + item.sourceText.length,
    0,
  );
  const estimatedTokens = totalChars / AVERAGE_CHARS_PER_TOKEN;

  // Calculate how many items we can fit in a chunk based on input token limit
  const itemsPerChunk = Math.max(
    1,
    Math.floor((MAX_INPUT_TOKENS / estimatedTokens) * content.length),
  );

  return itemsPerChunk;
}
