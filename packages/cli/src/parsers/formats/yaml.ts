import YAML from "yaml";
import { flatten, unflatten } from "../core/flatten.ts";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createYamlParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const parsed = YAML.parse(input) || {};
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Translation file must contain a YAML object");
        }
        return flatten(parsed);
      } catch (error) {
        throw new Error(
          `Failed to parse YAML translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data): Promise<string> {
      return YAML.stringify(unflatten(data), {
        lineWidth: -1,
      });
    },
  });
}
