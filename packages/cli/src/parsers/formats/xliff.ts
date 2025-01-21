import xliff from "xliff";
import { BaseParser } from "../core/base-parser.js";

interface XliffUnit {
  source: string;
}

interface XliffResources {
  [namespace: string]: {
    [key: string]: XliffUnit;
  };
}

interface XliffData {
  sourceLanguage: string;
  targetLanguage?: string;
  resources: XliffResources;
}

export class XliffParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = (await xliff.xliff2js(input)) as unknown as XliffData;
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Translation file must contain a valid XLIFF document");
      }

      // Extract sources from the XLIFF structure
      const flattened: Record<string, string> = {};
      for (const [namespace, units] of Object.entries(parsed.resources)) {
        for (const [key, unit] of Object.entries(units)) {
          const id = namespace === "default" ? key : `${namespace}.${key}`;
          flattened[id] = unit.source;
        }
      }

      return flattened;
    } catch (error) {
      throw new Error(
        `Failed to parse XLIFF translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      // Convert flat key-value pairs to XLIFF data structure
      const resources: XliffResources = {};

      for (const [key, value] of Object.entries(data)) {
        // Split the key into namespace and id parts
        const parts = key.split(".");
        const id = parts.pop()!;
        const namespace = parts.length > 0 ? parts.join(".") : "default";

        if (!resources[namespace]) {
          resources[namespace] = {};
        }

        resources[namespace][id] = {
          source: value,
        };
      }

      // Create XLIFF data structure that matches the library's expectations
      const xliffData = {
        version: "2.0",
        resources,
        xmlns: "urn:oasis:names:tc:xliff:document:2.0",
      } as unknown as Parameters<typeof xliff.js2xliff>[0];

      // Convert to XLIFF format
      const result = await xliff.js2xliff(xliffData);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to serialize XLIFF translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
