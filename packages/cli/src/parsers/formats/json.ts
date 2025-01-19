import { jsonrepair } from "jsonrepair";
import { flatten, unflatten } from "../core/flatten.ts";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createJsonParser(): Parser {
  return createFormatParser({
    async parse(input: string) {
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

    async serialize(_, data) {
      return `${JSON.stringify(unflatten(data), null, 2)}\n`;
    },
  });
}
