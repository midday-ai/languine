import type { Parser, ParserOptions } from "./types.js";

export type { ParserOptions };

export abstract class BaseParser implements Parser {
  constructor(protected options: ParserOptions) {}

  abstract parse(input: string): Promise<Record<string, string>>;

  abstract serialize(
    locale: string,
    data: Record<string, string>,
    originalData?: string | Record<string, unknown>,
  ): Promise<string>;
}
