import { BaseParser } from "../core/base-parser.ts";
import type { ParserOptions } from "../core/types.ts";

export class MarkdownParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    return {};
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    originalData?: string | Record<string, unknown>,
  ): Promise<string> {
    return "";
  }
}
