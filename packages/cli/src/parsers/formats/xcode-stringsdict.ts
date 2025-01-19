import { build as buildPlist, parse as parsePlist } from "plist";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createXcodeStringsDictParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const parsed = parsePlist(input) as Record<string, unknown>;
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Translation file must contain a valid plist");
        }

        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "string") {
            result[key] = value;
          }
        }

        return result;
      } catch (error) {
        throw new Error(
          `Failed to parse Xcode stringsdict translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data): Promise<string> {
      try {
        // Validate that all values are strings
        for (const [key, value] of Object.entries(data)) {
          if (typeof value !== "string") {
            throw new Error(`Value for key "${key}" must be a string`);
          }
        }
        return buildPlist(data);
      } catch (error) {
        throw new Error(
          `Failed to serialize Xcode stringsdict translations: ${(error as Error).message}`,
        );
      }
    },
  });
}
