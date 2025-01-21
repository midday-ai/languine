import { z } from "zod";
import type { Parser, ParserOptions } from "./core/types.js";
import { createAndroidParser } from "./formats/android.js";
import { createArbParser } from "./formats/arb.js";
import { createCsvParser } from "./formats/csv.js";
import { createHtmlParser } from "./formats/html.js";
import { createJavaScriptParser } from "./formats/javascript.js";
import { createJsonParser } from "./formats/json.js";
import { createMarkdownParser } from "./formats/markdown.js";
import { createPoParser } from "./formats/po.js";
import { createPropertiesParser } from "./formats/properties.js";
import { createXcodeStringsParser } from "./formats/xcode-strings.js";
import { createXcodeStringsDictParser } from "./formats/xcode-stringsdict.js";
import { createXcodeXcstringsParser } from "./formats/xcode-xcstrings.js";
import { createXliffParser } from "./formats/xliff.js";
import { createXmlParser } from "./formats/xml.js";
import { createYamlParser } from "./formats/yaml.js";

export const parserTypeSchema = z.enum([
  "js",
  "ts",
  "json",
  "po",
  "yaml",
  "xml",
  "xliff",
  "xcode-strings",
  "xcode-stringsdict",
  "xcode-xcstrings",
  "properties",
  "android",
  "md",
  "mdx",
  "html",
  "csv",
  "arb",
]);

export type ParserType = z.infer<typeof parserTypeSchema>;

export function createParser(options: ParserOptions): Parser {
  const { type } = options;

  switch (type) {
    case "android":
      return createAndroidParser({ type });
    case "arb":
      return createArbParser({ type });
    case "csv":
      return createCsvParser({ type });
    case "html":
      return createHtmlParser({ type });
    case "js":
    case "ts":
      return createJavaScriptParser({ type });
    case "json":
      return createJsonParser({ type });
    case "md":
    case "mdx":
      return createMarkdownParser({ type });
    case "po":
      return createPoParser({ type });
    case "xcode-strings":
      return createXcodeStringsParser({ type });
    case "xcode-stringsdict":
      return createXcodeStringsDictParser({ type });
    case "xcode-xcstrings":
      return createXcodeXcstringsParser({ type });
    case "properties":
      return createPropertiesParser({ type });
    case "xliff":
      return createXliffParser({ type });
    case "xml":
      return createXmlParser({ type });
    case "yaml":
      return createYamlParser({ type });
    default:
      throw new Error(`Unsupported parser type: ${type}`);
  }
}
