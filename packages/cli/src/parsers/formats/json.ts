import { jsonrepair } from "jsonrepair";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createJsonParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const parsed = JSON.parse(jsonrepair(input));
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Translation file must contain a JSON object");
        }
        return flatten(parsed);
      } catch (error) {
        throw new Error(
          `Failed to parse JSON translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(data: Record<string, string>): Promise<string> {
      return `${JSON.stringify(unflatten(data), null, 2)}\n`;
    },
  });
}

function flatten(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, newKey));
    } else if (typeof value === "string") {
      result[newKey] = value;
    } else {
      throw new Error(
        `Invalid translation value at "${newKey}": expected string, got ${typeof value}`,
      );
    }
  }

  return result;
}

function unflatten(data: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k] as Record<string, unknown>;
      }
    }
  }

  return result;
}
