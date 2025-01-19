import { Builder, parseStringPromise } from "xml2js";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

interface StringItem {
  name: string;
  value: string;
}

interface GroupedResources {
  strings: StringItem[];
  plurals: Record<string, Record<string, string>>;
  arrays: Record<string, string[]>;
}

interface AndroidResources {
  resources: {
    string?: Array<{ $: { name: string }; _: string }>;
    plurals?: Array<{
      $: { name: string };
      item: Array<{ $: { quantity: string }; _: string }>;
    }>;
    "string-array"?: Array<{
      $: { name: string };
      item: Array<string | { _?: string }>;
    }>;
  };
}

export function createAndroidParser(): Parser {
  return createFormatParser({
    async parse(input: string) {
      try {
        if (!input.trim().startsWith("<")) {
          throw new Error("Translation file must contain valid Android XML");
        }
        const parsed = await parseStringPromise(input, {
          explicitArray: true,
          mergeAttrs: false,
          normalize: true,
          preserveChildrenOrder: true,
          normalizeTags: true,
          trim: true,
        });

        if (!parsed.resources) {
          throw new Error(
            "Translation file must contain valid Android resources",
          );
        }

        const result: Record<string, string> = {};

        // Handle regular strings
        const strings = parsed.resources?.string || [];
        for (const string of strings) {
          if (string.$?.name && string._) {
            result[string.$.name] = string._;
          }
        }

        // Handle plurals
        const plurals = parsed.resources?.plurals || [];
        for (const plural of plurals) {
          if (plural.$?.name && plural.item) {
            for (const item of plural.item) {
              if (item.$?.quantity && item._) {
                result[`${plural.$.name}[${item.$.quantity}]`] = item._;
              }
            }
          }
        }

        // Handle string arrays
        const stringArrays = parsed.resources?.["string-array"] || [];
        for (const array of stringArrays) {
          if (array.$?.name && array.item) {
            array.item.forEach(
              (item: string | { _?: string }, index: number) => {
                const value = typeof item === "string" ? item : item._;
                if (value) {
                  result[`${array.$.name}[${index}]`] = value;
                }
              },
            );
          }
        }

        return result;
      } catch (error) {
        throw new Error(
          `Failed to parse Android XML translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data) {
      try {
        // If the data object is empty, return a simple empty resources tag
        if (Object.keys(data).length === 0) {
          return '<?xml version="1.0" encoding="utf-8"?>\n<resources/>';
        }

        const resources: AndroidResources = {
          resources: {},
        };

        // Group entries by their type
        const groups = Object.entries(data).reduce<GroupedResources>(
          (acc, [key, value]) => {
            if (key.includes("[")) {
              const [baseName, qualifier] = key.split("[");
              const cleanQualifier = qualifier.replace("]", "");

              if (Number.isNaN(Number(cleanQualifier))) {
                // Handle plurals
                if (!acc.plurals[baseName]) {
                  acc.plurals[baseName] = {};
                }
                acc.plurals[baseName][cleanQualifier] = value;
              } else {
                // Handle string arrays
                if (!acc.arrays[baseName]) {
                  acc.arrays[baseName] = [];
                }
                acc.arrays[baseName][Number(cleanQualifier)] = value;
              }
            } else {
              // Handle regular strings
              acc.strings.push({ name: key, value });
            }
            return acc;
          },
          { strings: [], plurals: {}, arrays: {} },
        );

        // Add regular strings
        if (groups.strings.length > 0) {
          resources.resources.string = groups.strings.map((s) => ({
            $: { name: s.name },
            _: s.value,
          }));
        }

        // Add plurals
        if (Object.keys(groups.plurals).length > 0) {
          resources.resources.plurals = Object.entries(groups.plurals).map(
            ([name, items]) => ({
              $: { name },
              item: Object.entries(items).map(([quantity, value]) => ({
                $: { quantity },
                _: value,
              })),
            }),
          );
        }

        // Add string arrays
        if (Object.keys(groups.arrays).length > 0) {
          resources.resources["string-array"] = Object.entries(
            groups.arrays,
          ).map(([name, items]) => ({
            $: { name },
            item: items.map((value) => value),
          }));
        }

        const builder = new Builder({
          xmldec: { version: "1.0", encoding: "utf-8" },
          renderOpts: {
            pretty: true,
            indent: "    ",
            newline: "\n",
          },
        });

        return builder.buildObject(resources);
      } catch (error) {
        throw new Error(
          `Failed to serialize Android XML translations: ${(error as Error).message}`,
        );
      }
    },
  });
}
