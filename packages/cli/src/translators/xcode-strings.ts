import { generateObject } from "ai";
import dedent from "dedent";
import { z } from "zod";
import { debug } from "../debug.js";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

const STRING_REGEX = /^"(.+)"\s*=\s*"(.+)";$/;

const UNESCAPE_REPLACEMENTS: Record<string, string> = {
  '\\"': '"',
  "\\n": "\n",
  "\\\\": "\\",
};

const ESCAPE_REPLACEMENTS: Record<string, string> = {
  "\\": "\\\\",
  '"': '\\"',
  "\n": "\\n",
};

function parseXcodeStrings(content: string) {
  debug("Parsing Xcode strings file");
  const result: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("//")) continue;

    const match = trimmedLine.match(STRING_REGEX);
    if (match) {
      const [, key, value] = match;
      result[key] = value.replace(
        /\\[\\n"]/g,
        (match) => UNESCAPE_REPLACEMENTS[match],
      );
    }
  }

  debug(`Successfully parsed ${Object.keys(result).length} strings`);
  return result;
}

function stringifyXcodeStrings(strings: Record<string, string>) {
  debug("Stringifying Xcode strings");
  const result = Object.entries(strings)
    .map(
      ([key, value]) =>
        `"${key}" = "${value.replace(/[\\"\n]/g, (match) => ESCAPE_REPLACEMENTS[match])}";`,
    )
    .join("\n");
  debug("Successfully stringified strings");
  return result;
}

export const xcodeStrings: Translator = {
  async onUpdate(options) {
    debug("Running Xcode strings translator onUpdate");
    const sourceStrings = parseXcodeStrings(options.content);
    const previousStrings = parseXcodeStrings(options.previousContent);

    const addedKeys = Object.keys(sourceStrings).filter(
      (key) =>
        !(key in previousStrings) ||
        previousStrings[key] !== sourceStrings[key],
    );

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
      prompt: getPrompt(JSON.stringify(toTranslate, null, 2), options),
      schema: z.object({
        items: z.array(z.string().describe("Translated string value")),
      }),
    });

    debug("Successfully generated translations");

    const translated = addedKeys.reduce<Record<string, string>>(
      (acc, key, index) => {
        acc[key] = object.items[index];
        return acc;
      },
      {},
    );

    debug("Successfully updated translations");
    return {
      summary: `Translated ${addedKeys.length} new keys`,
      content: stringifyXcodeStrings({
        ...parseXcodeStrings(options.previousTranslation),
        ...translated,
      }),
    };
  },

  async onNew(options) {
    debug("Running Xcode strings translator onNew");
    const sourceStrings = parseXcodeStrings(options.content);
    const sourceKeys = Object.keys(sourceStrings);

    debug("Generating translations for new file");
    const { object } = await generateObject({
      model: options.model,
      prompt: getPrompt(JSON.stringify(sourceStrings, null, 2), options),
      temperature: options.config.llm?.temperature ?? 0,
      schema: z.object({
        items: z.array(z.string().describe("Translated string value")),
      }),
    });

    debug("Successfully generated translations");

    const translatedStrings = sourceKeys.reduce<Record<string, string>>(
      (acc, key, index) => {
        acc[key] = object.items[index];
        return acc;
      },
      {},
    );

    return {
      content: stringifyXcodeStrings(translatedStrings),
    };
  },
};

function getPrompt(base: string, options: PromptOptions) {
  debug("Creating prompt for Xcode strings translation");
  const text = dedent`
    ${baseRequirements}
    - Preserve all key names exactly as they appear
    - Only translate the values, not the keys
    - Return translations as a JSON array of strings in the same order as input
    - Maintain all format specifiers like %@, %d, %1$@, etc. in the exact same order
    - Preserve any HTML tags or special formatting in the strings
  `;

  return createBasePrompt(`${text}\n${base}`, options);
}
