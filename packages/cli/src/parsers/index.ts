import { z } from "zod";
import type { Parser } from "./core/types.ts";
import { createJavaScriptParser } from "./formats/javascript.ts";
import { createJsonParser } from "./formats/json.ts";
import { createPoParser } from "./formats/po.ts";
import { createYamlParser } from "./formats/yml.ts";

export const parserTypeSchema = z.enum(["js", "ts", "json", "po", "yml"]);

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
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
