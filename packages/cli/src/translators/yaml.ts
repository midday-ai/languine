import { generateObject } from "ai";
import dedent from "dedent";
import YAML from "yaml";
import { z } from "zod";
import { debug } from "../debug.js";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

interface YamlEntry {
  key: string;
  value: string;
}

function parseYamlFile(content: string) {
  debug("Parsing YAML file");
  const doc = YAML.parse(content);
  const entries: YamlEntry[] = [];

  function traverse(obj: Record<string, unknown>, prefix = "") {
    if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          traverse(value as Record<string, unknown>, fullKey);
        } else {
          entries.push({
            key: fullKey,
            value: String(value),
          });
        }
      }
    }
  }

  traverse(doc);
  debug(`Successfully parsed ${entries.length} YAML entries`);
  return entries;
}

function stringifyYamlFile(entries: YamlEntry[]) {
  debug("Stringifying YAML entries");
  const doc = new YAML.Document();
  const obj: Record<string, unknown> = {};

  for (const { key, value } of entries) {
    const parts = key.split(".");
    let current = obj;

    // Build nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }

    const lastKey = parts[parts.length - 1];
    current[lastKey] = value;
  }

  doc.contents = doc.createNode(obj);
  debug("Successfully stringified YAML entries");
  return doc.toString();
}

export const yaml: Translator = {
  async onUpdate(options) {
    debug("Running YAML translator onUpdate");
    const sourceEntries = parseYamlFile(options.content);
    const previousEntries = parseYamlFile(options.previousContent);
    const previousTranslationEntries = parseYamlFile(
      options.previousTranslation,
    );

    const sourceMap = new Map(sourceEntries.map((entry) => [entry.key, entry]));
    const previousMap = new Map(
      previousEntries.map((entry) => [entry.key, entry]),
    );
    const prevTransMap = new Map(
      previousTranslationEntries.map((entry) => [entry.key, entry]),
    );

    const addedKeys = sourceEntries
      .filter(({ key, value }) => {
        const prev = previousMap.get(key);
        return !prev || prev.value !== value;
      })
      .map((entry) => entry.key);

    debug(`Found ${addedKeys.length} new or modified keys`);

    if (addedKeys.length === 0) {
      debug("No new keys to translate");
      return {
        summary: "No new keys to translate",
        content: options.previousTranslation,
      };
    }

    const toTranslate = Object.fromEntries(
      addedKeys.map((key) => [key, sourceMap.get(key)!.value]),
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

    // Update translations while preserving order
    const updatedEntries = sourceEntries.map(({ key }) => {
      const translationIndex = addedKeys.indexOf(key);
      const value =
        translationIndex !== -1
          ? object.items[translationIndex]
          : (prevTransMap.get(key)?.value ?? "");

      return { key, value };
    });

    debug("Successfully updated YAML entries");
    return {
      summary: `Translated ${addedKeys.length} new keys`,
      content: stringifyYamlFile(updatedEntries),
    };
  },

  async onNew(options) {
    debug("Running YAML translator onNew");
    const sourceEntries = parseYamlFile(options.content);
    const sourceStrings = Object.fromEntries(
      sourceEntries.map((entry) => [entry.key, entry.value]),
    );

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

    const translatedEntries = sourceEntries.map((entry, index) => ({
      ...entry,
      value: object.items[index],
    }));

    debug("Successfully created new YAML file");
    return {
      content: stringifyYamlFile(translatedEntries),
    };
  },
};

function getPrompt(base: string, options: PromptOptions) {
  const text = dedent`
    ${baseRequirements}
    - Preserve all YAML keys exactly as they appear
    - Only translate the values, not the keys
    - Return translations as a JSON array of strings in the same order as input
    - Maintain all format specifiers like {name}, {count}, etc. in the exact same order
    - Preserve any HTML tags or special formatting in the strings
  `;

  return createBasePrompt(`${text}\n${base}`, options);
}
