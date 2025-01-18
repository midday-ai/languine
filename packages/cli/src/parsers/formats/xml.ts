import { Builder, parseStringPromise } from "xml2js";
import { flatten, unflatten } from "../core/flatten.ts";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createXmlParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        if (!input.trim().startsWith("<")) {
          throw new Error("Translation file must contain valid XML");
        }
        const parsed = await parseStringPromise(input, {
          explicitArray: false,
          mergeAttrs: false,
          normalize: true,
          preserveChildrenOrder: true,
          normalizeTags: true,
          includeWhiteChars: true,
          trim: true,
        });
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Translation file must contain a XML object");
        }
        return flatten(parsed);
      } catch (error) {
        throw new Error(
          `Failed to parse XML translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(data: Record<string, string>): Promise<string> {
      try {
        const builder = new Builder({
          headless: true,
          renderOpts: {
            pretty: false,
          },
          rootName: "root",
        });
        const xmlOutput = builder
          .buildObject(unflatten(data))
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        return normalizeXMLString(xmlOutput);
      } catch (error) {
        throw new Error(
          `Failed to serialize XML translations: ${(error as Error).message}`,
        );
      }
    },
  });
}

function normalizeXMLString(xmlString: string): string {
  return xmlString
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace("\n", "")
    .trim();
}
