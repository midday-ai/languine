import { Builder, parseStringPromise } from "xml2js";
import { BaseParser } from "../core/base-parser.js";
import { flatten, unflatten } from "../core/flatten.js";

export class XmlParser extends BaseParser {
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
        `Failed to parse XML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
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
        `Failed to serialize XML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

function normalizeXMLString(xmlString: string): string {
  return xmlString
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace("\n", "")
    .trim();
}
