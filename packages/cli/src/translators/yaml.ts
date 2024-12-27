import { generateObject } from "ai";
import dedent from "dedent";
import YAML from "yaml";
import { z } from "zod";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

interface YamlEntry {
  key: string;
  value: string;
}

function parseYamlFile(content: string) {
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
  return entries;
}

function stringifyYamlFile(entries: YamlEntry[]) {
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
  return doc.toString();
}

export const yaml: Translator = {
  async onUpdate(options) {
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

    if (addedKeys.length === 0) {
      return {
        summary: "No new keys to translate",
        content: options.previousTranslation,
      };
    }

    const toTranslate = Object.fromEntries(
      addedKeys.map((key) => [key, sourceMap.get(key)!.value]),
    );

    const { object } = await generateObject({
      model: options.model,
      temperature: options.config.llm?.temperature ?? 0,
      prompt: getPrompt(JSON.stringify(toTranslate, null, 2), options),
      schema: z.object({
        items: z.array(z.string().describe("Translated string value")),
      }),
    });

    // Update translations while preserving order
    const updatedEntries = sourceEntries.map(({ key }) => {
      const translationIndex = addedKeys.indexOf(key);
      const value =
        translationIndex !== -1
          ? object.items[translationIndex]
          : (prevTransMap.get(key)?.value ?? "");

      return { key, value };
    });

    return {
      summary: `Translated ${addedKeys.length} new keys`,
      content: stringifyYamlFile(updatedEntries),
    };
  },

  async onNew(options) {
    const sourceEntries = parseYamlFile(options.content);
    const sourceStrings = Object.fromEntries(
      sourceEntries.map((entry) => [entry.key, entry.value]),
    );

    const { object } = await generateObject({
      model: options.model,
      prompt: getPrompt(JSON.stringify(sourceStrings, null, 2), options),
      temperature: options.config.llm?.temperature ?? 0,
      schema: z.object({
        items: z.array(z.string().describe("Translated string value")),
      }),
    });

    const translatedEntries = sourceEntries.map((entry, index) => ({
      ...entry,
      value: object.items[index],
    }));

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
