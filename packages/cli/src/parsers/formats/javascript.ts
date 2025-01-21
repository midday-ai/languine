import { BaseParser, type ParserOptions } from "../core/base-parser.js";
import { flatten, unflatten } from "../core/flatten.js";

export class JavaScriptParser extends BaseParser {
  async parse(input: string): Promise<Record<string, string>> {
    try {
      const cleanInput = this.preprocessInput(input);
      const parsed = this.evaluateJavaScript(cleanInput);
      this.validateParsedObject(parsed);
      return flatten(parsed);
    } catch (error) {
      throw new Error(
        `Failed to parse JavaScript/TypeScript: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const nested = unflatten(data);
      const formatted = this.formatTranslationObject(nested);
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

  private formatTranslationObject(obj: Record<string, unknown>): string {
    return this.formatObjectLiteral(obj, 0);
  }

  private formatObjectLiteral(
    obj: Record<string, unknown>,
    indent: number,
  ): string {
    if (Object.keys(obj).length === 0) {
      return "{}";
    }

    const indentStr = "  ".repeat(indent);
    const innerIndentStr = "  ".repeat(indent + 1);

    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
      const formattedValue =
        typeof value === "object" && value !== null
          ? this.formatObjectLiteral(
              value as Record<string, unknown>,
              indent + 1,
            )
          : `"${String(value).replace(/"/g, '\\"')}"`;
      return `${innerIndentStr}${formattedKey}: ${formattedValue}`;
    });

    return `{\n${entries.join(",\n")}\n${indentStr}}`;
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
}

export function createJavaScriptParser(
  options: ParserOptions,
): JavaScriptParser {
  return new JavaScriptParser(options);
}
