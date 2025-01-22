import { BaseParser } from "../core/base-parser.js";

export class JavaScriptParser extends BaseParser {
  async parse(input: string) {
    try {
      const cleanInput = this.preprocessInput(input);
      const parsed = this.evaluateJavaScript(cleanInput);
      this.validateParsedObject(parsed);

      // First collect all explicit dot notation keys
      const explicitDotKeys = new Set<string>();
      this.findExplicitDotKeys(cleanInput, explicitDotKeys);

      // Then flatten while preserving explicit dot notation
      return this.flattenObject(parsed);
    } catch (error) {
      throw new Error(
        `Failed to parse JavaScript/TypeScript: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    locale: string,
    data: Record<string, string>,
    originalData?: string | Record<string, unknown>,
  ): Promise<string> {
    // Flatten any nested objects in the input data
    const flatData = this.flattenObject(data);
    const content = this.formatFlatObject(flatData);
    return this.wrapInExport(content);
  }

  private formatFlatObject(obj: Record<string, string>): string {
    if (Object.keys(obj).length === 0) {
      return "{}";
    }

    const indentStr = "  ";
    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
      const formattedValue = `"${String(value).replace(/"/g, '\\"')}"`;
      return `${indentStr}${formattedKey}: ${formattedValue}`;
    });

    return `{\n${entries.join(",\n")}\n}`;
  }

  private needsQuotes(key: string): boolean {
    return (
      /[^a-zA-Z0-9_$]/.test(key) ||
      /^\d/.test(key) ||
      key.includes(".") ||
      !this.isValidIdentifier(key)
    );
  }

  private isValidIdentifier(key: string): boolean {
    try {
      new Function(`const ${key} = 0;`);
      return true;
    } catch {
      return false;
    }
  }

  private wrapInExport(content: string): string {
    return `export default ${content} as const;\n`;
  }

  private preprocessInput(input: string): string {
    let processed = input.trim();

    if (processed.startsWith("export default")) {
      processed = processed.slice("export default".length).trim();
    }

    if (processed.endsWith("as const;")) {
      processed = processed.slice(0, -"as const;".length).trim();
    } else if (processed.endsWith("as const")) {
      processed = processed.slice(0, -"as const".length).trim();
    }

    return processed;
  }

  private evaluateJavaScript(input: string): unknown {
    try {
      return new Function(`return ${input};`)();
    } catch (error) {
      throw new Error(`Invalid JavaScript syntax: ${(error as Error).message}`);
    }
  }

  private validateParsedObject(
    parsed: unknown,
  ): asserts parsed is Record<string, string | Record<string, unknown>> {
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Translation file must export an object");
    }

    const validateValue = (value: unknown, path: string[]): void => {
      if (typeof value === "string") {
        return;
      }
      if (typeof value === "object" && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          validateValue(val, [...path, key]);
        }
        return;
      }
      throw new Error(
        `Invalid translation value at ${path.join(".")}: values must be strings or nested objects with string values`,
      );
    };

    for (const [key, value] of Object.entries(parsed)) {
      validateValue(value, [key]);
    }
  }

  private findExplicitDotKeys(input: string, keys: Set<string>) {
    // Match both quoted and unquoted keys that contain dots
    const keyRegex = /(?:"([^"]+)"|'([^']+)'|([^{},\s:]+))(?=\s*:)/g;
    let match: RegExpExecArray | null = null;

    do {
      match = keyRegex.exec(input);
      if (match) {
        const key = match[1] || match[2] || match[3];
        if (key?.includes(".")) {
          keys.add(key);
        }
      }
    } while (match);
  }

  private flattenObject(
    obj: Record<string, unknown>,
    prefix = "",
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        result[fullPath] = value;
      } else if (typeof value === "object" && value !== null) {
        Object.assign(
          result,
          this.flattenObject(value as Record<string, unknown>, fullPath),
        );
      }
    }

    return result;
  }
}
