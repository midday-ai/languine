import { merge, pickBy } from "rambda";
import { BaseParser } from "../core/base-parser.js";

export class ArbParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const parsed = JSON.parse(input);
      return pickBy((_, key) => !key.startsWith("@"), parsed);
    } catch (error) {
      throw new Error(
        `Failed to parse ARB translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const result = merge({ "@@locale": _locale }, data);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to serialize ARB translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
