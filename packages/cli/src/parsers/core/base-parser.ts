import type { Parser, ParserOptions } from "./types.js";

export type { ParserOptions };

export abstract class BaseParser implements Parser {
  protected type: string;

  constructor(options: ParserOptions) {
    this.type = options.type;
  }

  abstract parse(input: string): Promise<Record<string, string>>;

  abstract serialize(
    locale: string,
    data: Record<string, string>,
    originalData?: Record<string, string>,
  ): Promise<string>;
}
