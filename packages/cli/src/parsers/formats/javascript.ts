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
      return this.flattenPreservingExplicit(parsed, explicitDotKeys);
    } catch (error) {
      throw new Error(
        `Failed to parse JavaScript/TypeScript: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    originalData?: Record<string, unknown>,
  ): Promise<string> {
    try {
      let formatted: string;
      if (originalData) {
        // If we have original data, try to preserve its structure
        const explicitDotKeys = new Set<string>();
        const nestedPaths = new Set<string>();

        // Find both explicit dot keys and nested paths from original
        const originalStr = JSON.stringify(originalData);
        this.findExplicitDotKeys(originalStr, explicitDotKeys);
        this.findNestedPaths(originalData, nestedPaths);

        // Split data into nested and flat based on original structure
        const [nested, flat] = this.partitionKeys(
          data,
          explicitDotKeys,
          nestedPaths,
        );
        formatted = this.formatMixedObject(nested, flat);
      } else {
        // Default to flat structure if no original data
        formatted = this.formatFlatObject(data);
      }
      return this.wrapInExport(formatted);
    } catch (error) {
      throw new Error(
        `Failed to serialize JavaScript/TypeScript: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
  ): asserts parsed is Record<string, unknown> {
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Translation file must export an object");
    }
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

  private findExplicitDotKeys(input: string, keys: Set<string>) {
    // Match both quoted dot notation keys and regular keys that are not nested objects
    const keyRegex =
      /(?:"([^"]+\.[^"]+)"|'([^']+\.[^']+)'|([^{},\s]+)):\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/g;
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

  private findNestedPaths(
    obj: Record<string, unknown>,
    paths: Set<string>,
    prefix = "",
  ) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        paths.add(fullPath);
        this.findNestedPaths(value as Record<string, unknown>, paths, fullPath);
      }
    }
  }

  private partitionKeys(
    data: Record<string, string>,
    explicitDotKeys: Set<string>,
    nestedPaths: Set<string>,
  ): [Record<string, string>, Record<string, string>] {
    const nested: Record<string, string> = {};
    const flat: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      const parts = key.split(".");
      const rootPath = parts[0];

      // Check if this key should be nested based on the original structure
      let shouldNest = false;
      for (const path of nestedPaths) {
        if (key.startsWith(`${path}.`) || key === path) {
          shouldNest = true;
          break;
        }
      }

      if (
        explicitDotKeys.has(key) ||
        (!shouldNest && explicitDotKeys.has(rootPath))
      ) {
        flat[key] = value;
      } else {
        nested[key] = value;
      }
    }

    return [nested, flat];
  }

  private formatMixedObject(
    nested: Record<string, string>,
    flat: Record<string, string>,
  ): string {
    if (Object.keys(nested).length === 0 && Object.keys(flat).length === 0) {
      return "{}";
    }

    const parts: string[] = [];

    // Format nested structure
    if (Object.keys(nested).length > 0) {
      const nestedObj = this.buildNestedObject(nested);
      const nestedEntries = Object.entries(nestedObj).map(([key, value]) => {
        const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
        const formattedValue =
          typeof value === "object" && value !== null
            ? this.formatObjectLiteral(value as Record<string, unknown>, 2)
            : `"${String(value).replace(/"/g, '\\"')}"`;
        return `  ${formattedKey}: ${formattedValue}`;
      });
      parts.push(...nestedEntries);
    }

    // Format flat structure
    if (Object.keys(flat).length > 0) {
      const flatEntries = Object.entries(flat).map(([key, value]) => {
        const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
        const formattedValue = `"${String(value).replace(/"/g, '\\"')}"`;
        return `  ${formattedKey}: ${formattedValue}`;
      });
      parts.push(...flatEntries);
    }

    return `{\n${parts.join(",\n")}\n}`;
  }

  private buildNestedObject(
    flat: Record<string, string>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // First, identify all root paths that should be objects
    const rootPaths = new Set<string>();
    for (const key of Object.keys(flat)) {
      const parts = key.split(".");
      if (parts.length > 1) {
        rootPaths.add(parts[0]);
      }
    }

    for (const [key, value] of Object.entries(flat)) {
      const parts = key.split(".");

      if (parts.length === 1) {
        // This is a top-level key
        result[key] = value;
      } else {
        // This is a nested key
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!(part in current)) {
            current[part] = {};
          }
          current = current[part] as Record<string, unknown>;
        }
        current[parts[parts.length - 1]] = value;
      }
    }

    return result;
  }

  private formatObjectLiteral(obj: Record<string, unknown>, level = 1): string {
    if (Object.keys(obj).length === 0) {
      return "{}";
    }

    const indent = "  ".repeat(level);
    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
      const formattedValue =
        typeof value === "object" && value !== null
          ? this.formatObjectLiteral(
              value as Record<string, unknown>,
              level + 1,
            )
          : `"${String(value).replace(/"/g, '\\"')}"`;
      return `${indent}${formattedKey}: ${formattedValue}`;
    });

    return `{\n${entries.join(",\n")}\n${"  ".repeat(level - 1)}}`;
  }

  private flattenPreservingExplicit(
    obj: Record<string, unknown>,
    explicitDotKeys: Set<string>,
    prefix = "",
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        result[fullKey] = value;
      } else if (typeof value === "object" && value !== null) {
        // If this is an explicit dot key, skip flattening this branch
        if (explicitDotKeys.has(fullKey)) {
          continue;
        }

        const nested = this.flattenPreservingExplicit(
          value as Record<string, unknown>,
          explicitDotKeys,
          fullKey,
        );
        Object.assign(result, nested);
      } else {
        throw new Error(`Invalid translation value for key "${fullKey}"`);
      }
    }

    return result;
  }
}
