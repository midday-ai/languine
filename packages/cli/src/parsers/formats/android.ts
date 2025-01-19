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

const XML_PARSER_OPTIONS = {
  explicitArray: true,
  mergeAttrs: false,
  normalize: true,
  preserveChildrenOrder: true,
  normalizeTags: true,
  trim: true,
} as const;

const XML_BUILDER_OPTIONS = {
  xmldec: { version: "1.0", encoding: "utf-8" },
  renderOpts: {
    pretty: true,
    indent: "    ",
    newline: "\n",
  },
} as const;

export function createAndroidParser(): Parser {
  return createFormatParser({
    async parse(input: string) {
      try {
        // Validate input is XML
        const trimmedInput = input.trim();
        if (!trimmedInput.startsWith("<")) {
          throw new Error("Translation file must contain valid Android XML");
        }

        // Parse XML to object
        const parsed = await parseStringPromise(input, XML_PARSER_OPTIONS);

        if (!parsed.resources) {
          throw new Error(
            "Translation file must contain valid Android resources",
          );
        }

        const result: Record<string, string> = {};

        // Process regular strings
        for (const string of parsed.resources?.string || []) {
          if (string.$?.name && string._) {
            result[string.$.name] = string._;
          }
        }

        // Process plurals
        for (const plural of parsed.resources?.plurals || []) {
          const name = plural.$?.name;
          if (name && plural.item) {
            for (const item of plural.item) {
              const quantity = item.$?.quantity;
              if (quantity && item._) {
                result[`${name}[${quantity}]`] = item._;
              }
            }
          }
        }

        // Process string arrays
        for (const array of parsed.resources?.["string-array"] || []) {
          const name = array.$?.name;
          if (name && array.item) {
            array.item.forEach(
              (item: string | { _?: string }, index: number) => {
                const value = typeof item === "string" ? item : item._;
                if (value) {
                  result[`${name}[${index}]`] = value;
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
        // Handle empty data case
        if (Object.keys(data).length === 0) {
          return '<?xml version="1.0" encoding="utf-8"?>\n<resources/>';
        }

        // Initialize resources object
        const resources: AndroidResources = { resources: {} };

        // Group and process entries
        const groups = Object.entries(data).reduce<GroupedResources>(
          (acc, [key, value]) => {
            if (!key.includes("[")) {
              // Regular strings
              acc.strings.push({ name: key, value });
              return acc;
            }

            const [baseName, qualifier] = key.split("[");
            const cleanQualifier = qualifier.replace("]", "");
            const qualifierNum = Number(cleanQualifier);

            if (Number.isNaN(qualifierNum)) {
              // Plurals
              if (!acc.plurals[baseName]) {
                acc.plurals[baseName] = {};
              }
              acc.plurals[baseName][cleanQualifier] = value;
            } else {
              // String arrays
              if (!acc.arrays[baseName]) {
                acc.arrays[baseName] = [];
              }
              acc.arrays[baseName][qualifierNum] = value;
            }

            return acc;
          },
          { strings: [], plurals: {}, arrays: {} },
        );

        // Build resources object
        if (groups.strings.length > 0) {
          resources.resources.string = groups.strings.map((s) => ({
            $: { name: s.name },
            _: s.value,
          }));
        }

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

        if (Object.keys(groups.arrays).length > 0) {
          resources.resources["string-array"] = Object.entries(
            groups.arrays,
          ).map(([name, items]) => ({
            $: { name },
            item: items.map((value) => value),
          }));
        }

        // Convert to XML
        const builder = new Builder(XML_BUILDER_OPTIONS);
        return builder.buildObject(resources);
      } catch (error) {
        throw new Error(
          `Failed to serialize Android XML translations: ${(error as Error).message}`,
        );
      }
    },
  });
}
