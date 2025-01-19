import { merge, pickBy } from "rambda";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createArbParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const parsed = JSON.parse(input);
        return pickBy((_, key) => !key.startsWith("@"), parsed);
      } catch (error) {
        throw new Error(
          `Failed to parse ARB translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(locale, data): Promise<string> {
      try {
        const result = merge({ "@@locale": locale }, data);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        throw new Error(
          `Failed to serialize ARB translations: ${(error as Error).message}`,
        );
      }
    },
  });
}
