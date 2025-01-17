import { z } from "zod";

export interface ParserOptions {
  type: string;
  filePath: string;
  defaultLocale: string;
}

export const parserOptionsSchema = z.object({
  type: z.string(),
  filePath: z.string(),
  defaultLocale: z.string(),
});

export interface Parser {
  parse(input: string): Promise<Record<string, string>>;
  serialize(data: Record<string, string>): Promise<string>;
}
