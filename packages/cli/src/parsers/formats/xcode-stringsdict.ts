import plist from "plist";
import { BaseParser } from "../core/base-parser.js";

type PlistValue =
  | string
  | number
  | boolean
  | Date
  | Buffer
  | PlistValue[]
  | { [key: string]: PlistValue };

interface PluralDict {
  NSStringLocalizedFormatKey: string;
  [key: string]:
    | {
        NSStringFormatSpecTypeKey: string;
        NSStringFormatValueTypeKey: string;
        zero?: string;
        one?: string;
        two?: string;
        few?: string;
        many?: string;
        other?: string;
      }
    | string;
}

export class XcodeStringsDictParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = plist.parse(input) as Record<string, unknown>;
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Translation file must contain a valid plist");
      }

      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string") {
          result[key] = value;
        } else if (typeof value === "object" && value !== null) {
          // Handle plural rules
          const pluralDict = value as PluralDict;
          if (pluralDict.NSStringLocalizedFormatKey) {
            // Store the plural forms as is - they will be handled by the iOS system
            result[key] = JSON.stringify(value);
          }
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse Xcode stringsdict translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const result: Record<string, PlistValue> = {};

      // Process each translation
      for (const [key, value] of Object.entries(data)) {
        if (typeof value !== "string") {
          throw new Error(`Value for key "${key}" must be a string`);
        }

        // Try to parse as JSON to see if it's a plural rule
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === "object" && parsed.NSStringLocalizedFormatKey) {
            result[key] = parsed as PlistValue;
            continue;
          }
        } catch {
          // Not JSON, treat as regular string
        }

        // Strip surrounding quotes if present
        const cleanValue = value.replace(/^"(.*)"$/, "$1");
        result[key] = cleanValue;
      }

      return plist.build(result);
    } catch (error) {
      throw new Error(
        `Failed to serialize Xcode stringsdict translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
