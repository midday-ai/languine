import YAML from "yaml";
import { BaseParser } from "../core/base-parser.js";
import { flatten, unflatten } from "../core/flatten.js";

export class YamlParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = YAML.parse(input) || {};
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Translation file must contain a YAML object");
      }
      return flatten(parsed);
    } catch (error) {
      throw new Error(
        `Failed to parse YAML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      return YAML.stringify(unflatten(data), {
        lineWidth: -1,
      });
    } catch (error) {
      throw new Error(
        `Failed to serialize YAML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
