import { jsonrepair } from "jsonrepair";
import { BaseParser, type ParserOptions } from "../core/base-parser.js";
import { flatten, unflatten } from "../core/flatten.js";

export class JsonParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = JSON.parse(jsonrepair(input));
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Translation file must contain a JSON object");
      }
      return flatten(parsed);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    return `${JSON.stringify(unflatten(data), null, 2)}\n`;
  }
}

export function createJsonParser(options: ParserOptions): JsonParser {
  return new JsonParser(options);
}
