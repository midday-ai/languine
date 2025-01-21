import { Builder, parseStringPromise } from "xml2js";
import { BaseParser, type ParserOptions } from "../core/base-parser.js";

interface StringItem {
  $: { name: string };
  _: string;
}

interface PluralItem {
  $: { quantity: string };
  _: string;
}

interface StringArrayItem {
  $: { name: string };
  item: string[];
}

interface AndroidResources {
  resources: {
    string?: StringItem[];
    "string-array"?: StringArrayItem[];
    plurals?: Array<{
      $: { name: string };
      item: PluralItem[];
    }>;
  };
}

interface GroupedResources {
  strings: Array<{ name: string; value: string }>;
  plurals: Record<string, Record<string, string>>;
  arrays: Record<string, string[]>;
}

const XML_BUILDER_OPTIONS = {
  xmldec: { version: "1.0", encoding: "utf-8" },
  renderOpts: { pretty: true, indent: "  ", newline: "\n" },
} as const;

export class AndroidParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      if (!input.trim().startsWith("<?xml")) {
        throw new Error("Input must be an XML document");
      }

      const result: Record<string, string> = {};
      const parsed = (await parseStringPromise(input)) as AndroidResources;

      if (!parsed.resources) {
        throw new Error(
          "Translation file must contain valid Android resources",
        );
      }

      // Parse strings
      if (parsed.resources.string) {
        for (const item of parsed.resources.string) {
          result[item.$.name] = item._;
        }
      }

      // Parse string arrays
      if (parsed.resources["string-array"]) {
        for (const array of parsed.resources["string-array"]) {
          array.item.forEach((value, index) => {
            result[`${array.$.name}[${index}]`] = value;
          });
        }
      }

      // Parse plurals
      if (parsed.resources.plurals) {
        for (const plural of parsed.resources.plurals) {
          for (const item of plural.item) {
            result[`${plural.$.name}[${item.$.quantity}]`] = item._;
          }
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to parse Android XML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
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
        resources.resources["string-array"] = Object.entries(groups.arrays).map(
          ([name, items]) => ({
            $: { name },
            item: items.map((value) => value),
          }),
        );
      }

      // Convert to XML
      const builder = new Builder(XML_BUILDER_OPTIONS);
      return builder.buildObject(resources);
    } catch (error) {
      throw new Error(
        `Failed to serialize Android XML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export function createAndroidParser(options: ParserOptions): AndroidParser {
  return new AndroidParser(options);
}
