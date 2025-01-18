import { z } from "zod";
import type { Parser } from "./core/types.ts";
import { createJavaScriptParser } from "./formats/javascript.ts";
import { createJsonParser } from "./formats/json.ts";
import { createPoParser } from "./formats/po.ts";
import { createXcodeStringsParser } from "./formats/xcode-strings.ts";
import { createXliffParser } from "./formats/xliff.ts";
import { createXmlParser } from "./formats/xml.ts";
import { createYamlParser } from "./formats/yml.ts";

export const parserTypeSchema = z.enum([
  "js",
  "ts",
  "json",
  "po",
  "yml",
  "xml",
  "xliff",
  "xcode-strings",
]);

export type ParserType = z.infer<typeof parserTypeSchema>;

export interface CreateParserOptions {
  type: string;
}

export function createParser(options: CreateParserOptions): Parser {
  switch (options.type) {
    case "js":
    case "ts":
      return createJavaScriptParser();
    case "json":
      return createJsonParser();
    case "po":
      return createPoParser();
    case "yml":
      return createYamlParser();
    case "xml":
      return createXmlParser();
    case "xliff":
      return createXliffParser();
    case "xcode-strings":
      return createXcodeStringsParser();
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
