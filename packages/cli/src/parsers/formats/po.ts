import { BaseParser } from "../core/base-parser.js";

export class PoParser extends BaseParser {
  async parse(input: string) {
    try {
      const result: Record<string, string> = {};
      const lines = input.split("\n");
      let currentKey = "";
      let currentValue = "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (isSkippableLine(trimmed)) {
          continue;
        }

        if (trimmed.startsWith("msgid")) {
          if (currentKey) {
            result[currentKey] = currentValue;
          }
          currentKey = parseMsgId(trimmed);
          currentValue = "";
        } else if (trimmed.startsWith("msgstr")) {
          currentValue = parseMsgStr(trimmed);
        }
      }

      if (currentKey) {
        result[currentKey] = currentValue;
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse PO: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      if (Object.keys(data).length === 0) {
        return "";
      }

      const result = Object.entries(data)
        .map(([key, value]) => {
          return `msgid "${key}"\nmsgstr "${value}"`;
        })
        .join("\n\n");

      return `${result}\n`;
    } catch (error) {
      throw new Error(
        `Failed to serialize PO: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

function isSkippableLine(line: string): boolean {
  return !line || line.startsWith("#");
}

function parseMsgId(line: string): string {
  const match = line.match(/msgid "(.*)"/);
  return match ? unescapeQuotes(match[1]) : "";
}

function parseMsgStr(line: string): string {
  const match = line.match(/msgstr "(.*)"/);
  return match ? unescapeQuotes(match[1]) : "";
}

function unescapeQuotes(str: string): string {
  return str.replace(/\\"/g, '"');
}
