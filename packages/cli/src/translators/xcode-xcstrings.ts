import { generateObject } from "ai";
import dedent from "dedent";
import { z } from "zod";
import { debug } from "../debug.js";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

interface StringUnit {
  state: string;
  value: string;
}

interface Localization {
  stringUnit?: StringUnit;
  variations?: {
    plural: Record<string, { stringUnit: StringUnit }>;
  };
}

interface TranslationEntity {
  extractionState: string;
  localizations: Record<string, Localization>;
}

interface XCStringsData {
  version: string;
  sourceLanguage: string;
  strings: Record<string, TranslationEntity>;
}

function parseXcodeXCStrings(content: string, locale: string) {
  debug("Parsing XCStrings file");
  const data = JSON.parse(content) as XCStringsData;
  const resultData: Record<string, string | Record<string, string>> = {};

  for (const [translationKey, translationEntity] of Object.entries(
    data.strings,
  )) {
    const langTranslationEntity = translationEntity?.localizations?.[locale];
    if (langTranslationEntity) {
      if (
        "stringUnit" in langTranslationEntity &&
        langTranslationEntity.stringUnit
      ) {
        resultData[translationKey] = langTranslationEntity.stringUnit.value;
      } else if (
        "variations" in langTranslationEntity &&
        langTranslationEntity.variations
      ) {
        if ("plural" in langTranslationEntity.variations) {
          resultData[translationKey] = {};
          const pluralForms = langTranslationEntity.variations.plural;
          for (const form in pluralForms) {
            if (pluralForms[form]?.stringUnit?.value) {
              (resultData[translationKey] as Record<string, string>)[form] =
                pluralForms[form].stringUnit.value;
            }
          }
        }
      }
    }
  }

  debug(`Successfully parsed ${Object.keys(resultData).length} strings`);
  return resultData;
}

function stringifyXcodeXCStrings(
  strings: Record<string, string | Record<string, string>>,
  locale: string,
  originalContent: string,
) {
  debug("Stringifying XCStrings");
  const originalData = JSON.parse(originalContent) as XCStringsData;
  const langDataToMerge: XCStringsData = {
    version: originalData.version,
    sourceLanguage: originalData.sourceLanguage,
    strings: {},
  };

  for (const [key, value] of Object.entries(strings)) {
    if (typeof value === "string") {
      langDataToMerge.strings[key] = {
        extractionState: "manual",
        localizations: {
          [locale]: {
            stringUnit: {
              state: "translated",
              value,
            },
          },
        },
      };
    } else {
      const updatedVariations: Record<string, { stringUnit: StringUnit }> = {};

      for (const form in value) {
        updatedVariations[form] = {
          stringUnit: {
            state: "translated",
            value: value[form],
          },
        };
      }

      langDataToMerge.strings[key] = {
        extractionState: "manual",
        localizations: {
          [locale]: {
            variations: {
              plural: updatedVariations,
            },
          },
        },
      };
    }
  }

  const result: XCStringsData = {
    version: originalData.version,
    sourceLanguage: originalData.sourceLanguage,
    strings: {
      ...originalData.strings,
      ...langDataToMerge.strings,
    },
  };

  debug("Successfully stringified XCStrings");
  return JSON.stringify(result, null, 2);
}

export const xcodeXCStrings: Translator = {
  async onUpdate(options) {
    debug("Running XCStrings translator onUpdate");
    const sourceStrings = parseXcodeXCStrings(
      options.content,
      options.config.locale.source,
    );
    const previousStrings = parseXcodeXCStrings(
      options.previousContent,
      options.config.locale.source,
    );

    const addedKeys = Object.keys(sourceStrings).filter((key) => {
      if (!(key in previousStrings)) return true;
      return (
        JSON.stringify(previousStrings[key]) !==
        JSON.stringify(sourceStrings[key])
      );
    });

    debug(`Found ${addedKeys.length} new or modified keys`);

    if (addedKeys.length === 0) {
      debug("No new keys to translate");
      return {
        summary: "No new keys to translate",
        content: options.previousTranslation,
      };
    }

    const toTranslate = Object.fromEntries(
      addedKeys.map((key) => [key, sourceStrings[key]]),
    );

    debug("Generating translations for new keys");
    const { object } = await generateObject({
      model: options.model,
      temperature: options.config.llm?.temperature ?? 0,
      mode: "json",
      prompt: getPrompt(JSON.stringify(toTranslate, null, 2), options),
      schema: z.object({
        items: z.array(
          z
            .union([z.string(), z.record(z.string(), z.string())])
            .describe("Translated string value or plural forms"),
        ),
      }),
    });
    debug("Successfully generated translations");

    const translated = addedKeys.reduce<
      Record<string, string | Record<string, string>>
    >((acc, key, index) => {
      acc[key] = object.items[index];
      return acc;
    }, {});

    return {
      summary: `Translated ${addedKeys.length} new keys`,
      content: stringifyXcodeXCStrings(
        {
          ...parseXcodeXCStrings(
            options.previousTranslation,
            options.targetLocale,
          ),
          ...translated,
        },
        options.targetLocale,
        options.previousTranslation,
      ),
    };
  },
  async onNew(options: PromptOptions) {
    debug("Running XCStrings translator onNew");
    const sourceStrings = parseXcodeXCStrings(
      options.content,
      options.config.locale.source,
    );

    const sourceKeys = Object.keys(sourceStrings);

    debug("Generating translations for new file");
    const { object } = await generateObject({
      model: options.model,
      prompt: getPrompt(JSON.stringify(sourceStrings, null, 2), options),
      temperature: options.config.llm?.temperature ?? 0,
      mode: "json",
      schema: z.object({
        items: z.array(
          z
            .union([z.string(), z.record(z.string(), z.string())])
            .describe("Translated string value or plural forms"),
        ),
      }),
    });
    debug("Successfully generated translations");

    const translatedStrings = sourceKeys.reduce<
      Record<string, string | Record<string, string>>
    >((acc, key, index) => {
      acc[key] = object.items[index];
      return acc;
    }, {});

    return {
      content: stringifyXcodeXCStrings(
        translatedStrings,
        options.targetLocale,
        options.content,
      ),
    };
  },
};

function getPrompt(base: string, options: PromptOptions) {
  const text = dedent`
    ${baseRequirements}
    - Preserve all key names exactly as they appear
    - Only translate the values, not the keys
    - Return translations as a JSON array in the same order as input
    - For simple strings, return the translated string
    - For plural forms, return an object with translated values for each form (zero, one, two, few, many, other)
    - Maintain all format specifiers like %@, %d, %lld, %1$@, etc. in the exact same order
    - Preserve any HTML tags or special formatting in the strings
  `;

  return createBasePrompt(`${text}\n${base}`, options);
}
