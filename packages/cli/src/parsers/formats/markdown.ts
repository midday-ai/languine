import { BaseParser } from "../core/base-parser.ts";

export class MarkdownParser extends BaseParser {
  async parse(input: string) {
    return { content: input };
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
  ): Promise<string> {
    return data.content;
  }
}
