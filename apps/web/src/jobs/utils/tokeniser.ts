import { createFinalPrompt } from "./prompt";
import type { PromptOptions } from "./types";

export function estimateTokensForContent(
  content: Array<{ key: string; sourceText: string }>,
  options?: PromptOptions,
) {
  // Calculate tokens based on character count (rough estimation)
  const contentTokens = content.reduce(
    (sum, item) => sum + Math.ceil(item.sourceText.length / 4),
    0,
  );

  // Add estimated prompt tokens if options are provided
  let promptTokens = 0;
  if (options) {
    const prompt = createFinalPrompt(content, options);
    promptTokens = Math.ceil(prompt.length / 4);
  }

  return contentTokens + promptTokens;
}
