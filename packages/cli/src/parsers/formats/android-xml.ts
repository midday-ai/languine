import { Builder, parseStringPromise } from "xml2js";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createAndroidXmlParser(): Parser {
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
        const strings = parsed.resources?.string || [];

        for (const string of strings) {
          if (string.$?.name && string._) {
            result[string.$.name] = string._;
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
        const resources = {
          resources: {
            string: Object.entries(data).map(([key, value]) => ({
              $: { name: key },
              _: value,
            })),
          },
        };

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
