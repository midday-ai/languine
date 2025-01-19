import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createXcodeStringsParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const lines = input.split("\n");
        const result: Record<string, string> = {};

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("//")) {
            const match = trimmedLine.match(/^"(.+)"\s*=\s*"(.+)";$/);
            if (match) {
              const [, key, value] = match;
              result[key] = unescapeXcodeString(value);
            } else {
              throw new Error(`Invalid syntax in line: ${trimmedLine}`);
            }
          }
        }

        return result;
      } catch (error) {
        throw new Error(
          `Failed to parse Xcode strings translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data): Promise<string> {
      try {
        const lines = Object.entries(data).map(([key, value]) => {
          const escapedValue = escapeXcodeString(value);
          return `"${key}" = "${escapedValue}";`;
        });
        return `${lines.join("\n")}\n`;
      } catch (error) {
        throw new Error(
          `Failed to serialize Xcode strings translations: ${(error as Error).message}`,
        );
      }
    },
  });
}

function unescapeXcodeString(str: string): string {
  return str.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
}

function escapeXcodeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
