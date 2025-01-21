import JSON5 from "json5";
import { mergeDeepRight } from "rambda";
import { BaseParser } from "../core/base-parser.js";
import type { XcstringsOutput, XcstringsTranslationEntity } from "./types.js";

export class XcodeXcstringsParser extends BaseParser {
  async parse(input: string) {
    try {
      const parsed = JSON5.parse(input);
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
    locale: string,
    data: Record<string, string>,
    originalData?: string,
  ): Promise<string> {
    try {
      // Validate input data
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          throw new Error(`Value for key "${key}" is undefined`);
        }
      }

      // Parse original data if provided, otherwise create new structure
      const baseResult: XcstringsOutput = originalData
        ? JSON5.parse(originalData)
        : {
            strings: {},
            version: "1.0",
            sourceLanguage: locale,
          };

      // Add or update translations for the target locale
      for (const [key, value] of Object.entries(data)) {
        if (!baseResult.strings[key]) {
          baseResult.strings[key] = {
            extractionState: "manual",
            localizations: {},
          };
        }

        // Add the new locale translation while preserving existing ones
        baseResult.strings[key].localizations = {
          ...baseResult.strings[key].localizations,
          [locale]: {
            stringUnit: {
              state: "translated",
              value,
            },
          },
        };
      }

      // Use JSON5 stringify for better readability
      return JSON5.stringify(baseResult, {
        space: 2,
        quote: '"', // Keep double quotes for better Xcode compatibility
      });
    } catch (error) {
      throw new Error(
        `Failed to serialize Xcode xcstrings translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
