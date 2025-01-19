import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createPropertiesParser(): Parser {
  return createFormatParser({
    async parse(input: string) {
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
    },

    async serialize(_, data) {
      return `${Object.entries(data)
        .filter(([_, value]) => value != null)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")}\n`;
    },
  });
}
