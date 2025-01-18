import { marked } from "marked";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createMarkdownParser(): Parser {
  return createFormatParser({
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
          `Failed to parse Markdown translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(data: Record<string, string>): Promise<string> {
      try {
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
          `Failed to serialize Markdown translations: ${(error as Error).message}`,
        );
      }
    },
  });
}
