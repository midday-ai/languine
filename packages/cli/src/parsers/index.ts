import { z } from "zod";
import type { Parser } from "./core/types.js";
import { createJavaScriptParser } from "./formats/javascript.js";
import { createJsonParser } from "./formats/json.js";

export const parserTypeSchema = z.enum(["js", "ts", "json"]);

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
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
