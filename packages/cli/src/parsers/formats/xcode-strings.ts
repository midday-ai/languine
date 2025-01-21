import { BaseParser } from "../core/base-parser.js";

export class XcodeStringsParser extends BaseParser {
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
        `Failed to parse Xcode strings translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const lines = Object.entries(data).map(([key, value]) => {
        const escapedValue = escapeXcodeString(value);
        return `"${key}" = "${escapedValue}";`;
      });
      return `${lines.join("\n")}\n`;
    } catch (error) {
      throw new Error(
        `Failed to serialize Xcode strings translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

function unescapeXcodeString(str: string): string {
  return str.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
}

function escapeXcodeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
