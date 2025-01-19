import { z } from "zod";
import type { Parser } from "./core/types.ts";
import { createAndroidXmlParser } from "./formats/android-xml.ts";
import { createArbParser } from "./formats/arb.ts";
import { createCsvParser } from "./formats/csv.ts";
import { createHtmlParser } from "./formats/html.ts";
import { createJavaScriptParser } from "./formats/javascript.ts";
import { createJsonParser } from "./formats/json.ts";
import { createMarkdownParser } from "./formats/markdown.ts";
import { createPoParser } from "./formats/po.ts";
import { createPropertiesParser } from "./formats/properties.ts";
import { createXcodeStringsParser } from "./formats/xcode-strings.ts";
import { createXcodeStringsDictParser } from "./formats/xcode-stringsdict.ts";
import { createXcodeXcstringsParser } from "./formats/xcode-xcstrings.ts";
import { createXliffParser } from "./formats/xliff.ts";
import { createXmlParser } from "./formats/xml.ts";
import { createYamlParser } from "./formats/yaml.ts";

export const parserTypeSchema = z.enum([
  "js",
  "ts",
  "json",
  "po",
  "yml",
  "xml",
  "xliff",
  "xcode-strings",
  "xcode-stringsdict",
  "xcode-xcstrings",
  "properties",
  "android-xml",
  "md",
  "mdx",
  "html",
  "csv",
  "arb",
]);

export type ParserType = z.infer<typeof parserTypeSchema>;

export interface CreateParserOptions {
  type: string;
}

export function createParser(options: CreateParserOptions): Parser {
  switch (options.type) {
    case "android-xml":
      return createAndroidXmlParser();
    case "arb":
      return createArbParser();
    case "csv":
      return createCsvParser();
    case "html":
      return createHtmlParser();
    case "js":
    case "ts":
      return createJavaScriptParser();
    case "json":
      return createJsonParser();
    case "md":
    case "mdx":
      return createMarkdownParser();
    case "po":
      return createPoParser();
    case "xcode-strings":
      return createXcodeStringsParser();
    case "xcode-stringsdict":
      return createXcodeStringsDictParser();
    case "xcode-xcstrings":
      return createXcodeXcstringsParser();
    case "properties":
      return createPropertiesParser();
    case "xliff":
      return createXliffParser();
    case "xml":
      return createXmlParser();
    case "yml":
      return createYamlParser();
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
