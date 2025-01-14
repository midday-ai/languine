import { javascript } from "./js";
import { markdown } from "./md";
import type { Translator } from "./types";

/**
/**
 * Get adapter from file extension/format
 *
 * This will lazy-load the adapters to reduce memory usage and improve server performance
 */
export async function getTranslator(
  format: string,
): Promise<Translator | undefined> {
  switch (format) {
    case "ts":
    case "js":
      return javascript;
    case "md":
    case "mdx":
      return markdown;

    default:
      return undefined;
  }
}
