import { BaseParser } from "../core/base-parser.js";

export class PropertiesParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const result: Record<string, string> = {};
      const lines = input.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }

        const [key, ...valueParts] = trimmed.split("=");
        const trimmedKey = key?.trim();
        if (trimmedKey) {
          result[trimmedKey] = valueParts.join("=").trim();
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse Properties: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      return `${Object.entries(data)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")}\n`;
    } catch (error) {
      throw new Error(
        `Failed to serialize Properties: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
