import type {
  Awaitable,
  PromptOptions,
  PromptResult,
  Translator,
  UpdateOptions,
  UpdateResult,
} from "../types.js";
import { javascript } from "./js.js";
import { json } from "./json.js";
import { markdown } from "./md.js";

/**
 * Get adapter from file extension/format
 *
 * This will lazy-load the adapters to reduce memory usage and improve server performance
 */
export async function getTranslator(
  format: string,
): Promise<Translator | undefined> {
  if (format === "ts" || format === "js") {
    return javascript;
  }

  if (format === "json" || format === "json5") {
    return json;
  }

  if (format === "md" || format === "mdx") {
    return markdown;
  }
}
