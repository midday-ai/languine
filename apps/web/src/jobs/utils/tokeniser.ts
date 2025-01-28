import { type TiktokenModel, encoding_for_model } from "tiktoken";

export function estimateTokensForContent(
  content: Array<{ key: string; sourceText: string }>,
  model: string,
) {
  try {
    const encoder = encoding_for_model(model as TiktokenModel);
    const totalTokens = content.reduce((sum, item) => {
      const tokens = encoder.encode(item.sourceText);
      return sum + tokens.length;
    }, 0);
    encoder.free();

    return totalTokens;
  } catch (error) {
    // Fallback to character-based estimation
    return content.reduce(
      (sum, item) => sum + Math.ceil(item.sourceText.length / 4),
      0,
    );
  }
}
