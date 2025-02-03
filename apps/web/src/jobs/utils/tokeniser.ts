import { type TiktokenModel, encoding_for_model } from "tiktoken";
import { createFinalPrompt } from "./prompt";
import type { PromptOptions } from "./types";

export function estimateTokensForContent(
  content: Array<{ key: string; sourceText: string }>,
  model: string,
  options?: PromptOptions,
) {
  try {
    const encoder = encoding_for_model(model as TiktokenModel);

    // Get base content tokens
    const contentTokens = content.reduce((sum, item) => {
      const tokens = encoder.encode(item.sourceText);
      return sum + tokens.length;
    }, 0);

    // Add prompt tokens if options are provided
    let promptTokens = 0;
    if (options) {
      const prompt = createFinalPrompt(content, options);
      promptTokens = encoder.encode(prompt).length;
    }

    encoder.free();
    return contentTokens + promptTokens;
  } catch (error) {
    // Fallback to character-based estimation
    const contentChars = content.reduce(
      (sum, item) => sum + Math.ceil(item.sourceText.length / 4),
      0,
    );

    // Add estimated prompt chars if options are provided
    let promptChars = 0;
    if (options) {
      const prompt = createFinalPrompt(content, options);
      promptChars = Math.ceil(prompt.length / 4);
    }

    return contentChars + promptChars;
  }
}
