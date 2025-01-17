import { z } from "zod";
import type { Parser } from "./core/types.js";
import { createJavaScriptParser } from "./formats/javascript.js";

export const parserTypeSchema = z.enum(["js", "ts"]);

export type ParserType = z.infer<typeof parserTypeSchema>;

export interface CreateParserOptions {
  type: ParserType;
}

export function createParser(options: CreateParserOptions): Parser {
  switch (options.type) {
    case "js":
    case "ts":
      return createJavaScriptParser();
    default:
      throw new Error(`Unsupported parser type: ${options.type}`);
  }
}
