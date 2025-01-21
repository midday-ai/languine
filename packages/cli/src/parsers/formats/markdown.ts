import { marked } from "marked";
import { BaseParser, type ParserOptions } from "../core/base-parser.js";

export class MarkdownParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const tokens = marked.lexer(input);
      const result: Record<string, string> = {};

      // Extract text content from markdown tokens
      for (const token of tokens) {
        if (token.type === "heading") {
          const key = `heading.${token.depth}`;
          result[key] = token.text;
        } else if (token.type === "paragraph") {
          result[`paragraph.${Object.keys(result).length}`] = token.text;
        } else if (token.type === "list") {
          token.items.forEach((item: { text: string }, index: number) => {
            result[`list.${index}`] = item.text;
          });
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse Markdown translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      // Validate input data
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          throw new Error(`Value for key "${key}" is undefined`);
        }
      }

      const markdownParts: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("heading.")) {
          const depth = Number.parseInt(key.split(".")[1], 10);
          markdownParts.push(`${"#".repeat(depth)} ${value}\n`);
        } else if (key.startsWith("paragraph.")) {
          markdownParts.push(`${value}\n\n`);
        } else if (key.startsWith("list.")) {
          markdownParts.push(`- ${value}\n`);
        }
      }

      return markdownParts.join("");
    } catch (error) {
      throw new Error(
        `Failed to serialize Markdown translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export function createMarkdownParser(options: ParserOptions): MarkdownParser {
  return new MarkdownParser(options);
}
