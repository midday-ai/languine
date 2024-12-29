import { generateObject } from "ai";
import dedent from "dedent";
import { Builder, parseStringPromise } from "xml2js";
import { z } from "zod";
import { debug } from "../debug.js";
import { baseRequirements, createBasePrompt } from "../prompt.js";
import type { PromptOptions, Translator } from "../types.js";

interface AndroidResource {
  $: {
    name: string;
    [key: string]: string;
  };
  _?: string;
  item?: Array<{ $?: { quantity?: string }; _: string } | string>;
}

interface AndroidResources {
  resources: {
    string?: AndroidResource[];
    "string-array"?: AndroidResource[];
    plurals?: AndroidResource[];
    bool?: AndroidResource[];
    integer?: AndroidResource[];
  };
}

async function parseXmlFile(content: string): Promise<AndroidResources> {
  try {
    const parsed = (await parseStringPromise(content, {
      explicitArray: true,
      mergeAttrs: false,
      normalize: true,
      preserveChildrenOrder: true,
      normalizeTags: true,
      includeWhiteChars: true,
      trim: true,
    })) as AndroidResources;
    debug("Successfully parsed Android XML file");
    return parsed;
  } catch {
    debug("Failed to parse Android XML file, returning empty resources");
    return { resources: {} };
  }
}

function stringifyXmlFile(data: AndroidResources): string {
  try {
    const builder = new Builder({
      headless: false,
      xmldec: { version: "1.0", encoding: "utf-8" },
      renderOpts: { pretty: true, indent: "    " },
      // Preserve comments from source XML
      rootName: "resources",
      cdata: true,
    });
    const xmlOutput = builder.buildObject(data);
    debug("Successfully built Android XML output");
    return xmlOutput;
  } catch (error) {
    console.error("Failed to build Android XML:", error);
    debug("Failed to build Android XML output");
    return "";
  }
}

function processAndroidResources(
  resources: AndroidResources,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const processResource = (
    resourceType: keyof AndroidResources["resources"],
  ) => {
    const items = resources.resources[resourceType];
    if (!items) return;

    debug(`Processing ${items.length} ${resourceType} resources`);

    for (const item of items) {
      if (resourceType === "string") {
        result[item.$.name] = item._ || "";
      } else if (resourceType === "string-array") {
        result[item.$.name] = (item.item || [])
          .map((subItem) => {
            if (typeof subItem === "string") return subItem;
            if ("_" in subItem) return subItem._ || "";
            return "";
          })
          .filter(Boolean);
      } else if (resourceType === "plurals") {
        const pluralObj: Record<string, string> = {};
        if (Array.isArray(item.item)) {
          for (const subItem of item.item) {
            if (typeof subItem === "object" && subItem.$?.quantity) {
              pluralObj[subItem.$.quantity] = subItem._ || "";
            }
          }
        }
        result[item.$.name] = pluralObj;
      } else if (resourceType === "bool") {
        result[item.$.name] = item._ === "true";
      } else if (resourceType === "integer") {
        result[item.$.name] = Number.parseInt(item._ || "0", 10);
      }
    }
  };

  for (const type of ["string", "string-array", "plurals", "bool", "integer"]) {
    processResource(type as keyof AndroidResources["resources"]);
  }

  debug(`Processed ${Object.keys(result).length} total resources`);
  return result;
}

function createAndroidResources(
  data: Record<string, unknown>,
): AndroidResources {
  debug("Creating Android resources from data");
  const xmlObj: AndroidResources = { resources: {} };

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      if (!xmlObj.resources.string) xmlObj.resources.string = [];
      xmlObj.resources.string.push({ $: { name: key }, _: value });
    } else if (Array.isArray(value)) {
      if (!xmlObj.resources["string-array"])
        xmlObj.resources["string-array"] = [];
      xmlObj.resources["string-array"].push({
        $: { name: key },
        item: value.map((item) => ({ _: item })),
      });
    } else if (typeof value === "object") {
      if (!xmlObj.resources.plurals) xmlObj.resources.plurals = [];
      xmlObj.resources.plurals.push({
        $: { name: key },
        item: Object.entries(value || {}).map(([quantity, text]) => ({
          $: { quantity },
          _: text as string,
        })),
      });
    } else if (typeof value === "boolean") {
      if (!xmlObj.resources.bool) xmlObj.resources.bool = [];
      xmlObj.resources.bool.push({ $: { name: key }, _: value.toString() });
    } else if (typeof value === "number") {
      if (!xmlObj.resources.integer) xmlObj.resources.integer = [];
      xmlObj.resources.integer.push({ $: { name: key }, _: value.toString() });
    }
  }

  debug("Successfully created Android resources");
  return xmlObj;
}

export const android: Translator = {
  async onUpdate(options) {
    debug("Running Android translator onUpdate");
    const sourceData = await parseXmlFile(options.content);
    const previousData = await parseXmlFile(options.previousContent);
    const previousTranslationData = await parseXmlFile(
      options.previousTranslation,
    );

    const sourceStrings = JSON.stringify(processAndroidResources(sourceData));
    const previousStrings = JSON.stringify(
      processAndroidResources(previousData),
    );

    if (sourceStrings === previousStrings) {
      debug("No changes detected in source strings");
      return {
        summary: "No new strings to translate",
        content: options.previousTranslation,
      };
    }

    debug("Generating translations for updated strings");
    const { object } = await generateObject({
      model: options.model,
      temperature: options.config.llm?.temperature ?? 0,
      prompt: getPrompt(sourceStrings, options),
      mode: "json",
      schema: z.object({
        items: z.record(z.string(), z.unknown()).describe("Translated strings"),
      }),
    });

    // Merge with previous translation data to preserve untranslated strings
    const mergedTranslation = {
      ...processAndroidResources(previousTranslationData),
      ...object.items,
    };

    debug("Successfully merged translations with previous data");
    return {
      summary: "Translated Android resources",
      content: stringifyXmlFile(createAndroidResources(mergedTranslation)),
    };
  },

  async onNew(options) {
    debug("Running Android translator onNew");
    const sourceData = await parseXmlFile(options.content);
    const sourceStrings = JSON.stringify(processAndroidResources(sourceData));

    debug("Generating translations for new strings");
    const { object } = await generateObject({
      model: options.model,
      prompt: getPrompt(sourceStrings, options),
      mode: "json",
      temperature: options.config.llm?.temperature ?? 0,
      schema: z.object({
        items: z.record(z.string(), z.unknown()).describe("Translated strings"),
      }),
    });

    debug("Successfully generated translations");
    return {
      content: stringifyXmlFile(createAndroidResources(object.items)),
    };
  },
};

function getPrompt(base: string, options: PromptOptions) {
  debug("Creating prompt for Android translation");
  const text = dedent`
    ${baseRequirements}
    - Preserve Android resource XML structure exactly
    - Support translation of strings, string-arrays, plurals, bools, and integers
    - Only translate text content, not resource names or attributes
    - Return translations as a JSON object matching the original structure
    - Maintain all format specifiers (like %1$s, %d) in the exact same order
    - Preserve any HTML tags or special formatting in the strings
    - Return the translations in the form of a JSON object specified in the schema
  `;

  return createBasePrompt(`${text}\n${base}`, options);
}
