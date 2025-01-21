import { z } from "zod";

export interface ParserOptions {
  type: string;
}

export const parserOptionsSchema = z.object({
  type: z.string(),
});

export interface Parser {
  parse(input: string): Promise<Record<string, string>>;
  serialize(
    locale: string,
    data: Record<string, string>,
    originalData?: Record<string, string>,
  ): Promise<string>;
}
