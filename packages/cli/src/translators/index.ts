import type { Translator } from "../types.js";
import { android } from "./android.js";
import { javascript } from "./js.js";
import { json } from "./json.js";
import { markdown } from "./md.js";
import { po } from "./po.js";
import { xcodeStrings } from "./xcode-strings.js";
import { xcodeStringsdict } from "./xcode-stringsdict.js";
import { xcodeXCStrings } from "./xcode-xcstrings.js";
import { yaml } from "./yaml.js";

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
    case "json":
      return json;
    case "md":
    case "mdx":
      return markdown;
    case "xcode-strings":
      return xcodeStrings;
    case "xcode-xcstrings":
      return xcodeXCStrings;
    case "xcode-stringsdict":
      return xcodeStringsdict;
    case "po":
      return po;
    case "yaml":
      return yaml;
    case "android":
      return android;
    default:
      return undefined;
  }
}
