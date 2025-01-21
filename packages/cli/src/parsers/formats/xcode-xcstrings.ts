import { mergeDeepRight } from "rambda";
import { BaseParser, type ParserOptions } from "../core/base-parser.js";
import type { XcstringsOutput, XcstringsTranslationEntity } from "./types.js";

export class XcodeXcstringsParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = JSON.parse(input);
      const result: Record<string, string> = {};

      for (const [key, translationEntity] of Object.entries(parsed.strings)) {
        const entity = translationEntity as XcstringsTranslationEntity;

        // Get first locale's translation
        const firstLocale = Object.keys(entity.localizations || {})[0];
        if (!firstLocale) continue;

        const localization = entity.localizations?.[firstLocale];
        if (!localization) continue;

        if ("stringUnit" in localization) {
          result[key] = localization.stringUnit?.value || "";
        } else if ("variations" in localization) {
          if ("plural" in (localization.variations || {})) {
            const pluralForms = localization.variations?.plural || {};
            // Store first plural form value
            const firstForm = Object.values(pluralForms)[0];
            if (firstForm?.stringUnit?.value) {
              result[key] = firstForm.stringUnit.value;
            }
          }
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse Xcode xcstrings translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      // Validate input data
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          throw new Error(`Value for key "${key}" is undefined`);
        }
      }

      const result: XcstringsOutput = {
        strings: {},
        version: "1.0",
        sourceLanguage: _locale,
      };

      for (const [key, value] of Object.entries(data)) {
        result.strings[key] = {
          extractionState: "manual",
          localizations: {
            [_locale]: {
              stringUnit: {
                state: "translated",
                value,
              },
            },
          },
        };
      }

      return JSON.stringify(mergeDeepRight({}, result), null, 2);
    } catch (error) {
      throw new Error(
        `Failed to serialize Xcode xcstrings translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export function createXcodeXcstringsParser(
  options: ParserOptions,
): XcodeXcstringsParser {
  return new XcodeXcstringsParser(options);
}
