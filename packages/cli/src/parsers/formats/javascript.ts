import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createJavaScriptParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
      try {
        const cleanInput = preprocessInput(input);
        const parsed = evaluateJavaScript(cleanInput);
        validateParsedObject(parsed);
        return flattenTranslations(parsed as Record<string, unknown>);
      } catch (error) {
        throw new TranslationParseError(error as Error);
      }
    },

    async serialize(data: Record<string, string>): Promise<string> {
      const nested = unflattenTranslations(data);
      const formatted = formatTranslationObject(nested);
      return wrapInExport(formatted);
    },
  });
}

// Error class for better error handling
class TranslationParseError extends Error {
  constructor(originalError: Error) {
    super(
      `Failed to parse JavaScript/TypeScript translations: ${originalError.message}`,
    );
    this.name = "TranslationParseError";
  }
}

function preprocessInput(input: string): string {
  let processed = input.trim();

  // Remove export default if present
  if (processed.startsWith("export default")) {
    processed = processed.slice("export default".length).trim();
  }

  // Remove as const if present
  if (processed.endsWith("as const;")) {
    processed = processed.slice(0, -"as const;".length).trim();
  } else if (processed.endsWith("as const")) {
    processed = processed.slice(0, -"as const".length).trim();
  }

  return processed;
}

function evaluateJavaScript(input: string): unknown {
  try {
    return new Function(`return ${input};`)();
  } catch (error) {
    throw new Error(`Invalid JavaScript syntax: ${(error as Error).message}`);
  }
}

function validateParsedObject(
  parsed: unknown,
): asserts parsed is Record<string, unknown> {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Translation file must export an object");
  }
}

function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      Object.assign(
        result,
        flattenTranslations(value as Record<string, unknown>, newKey),
      );
    } else if (typeof value === "string") {
      result[newKey] = value;
    } else {
      throw new Error(
        `Invalid translation value at "${newKey}": expected string, got ${typeof value}`,
      );
    }
  }

  return result;
}

function unflattenTranslations(
  data: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k] as Record<string, unknown>;
      }
    }
  }

  return result;
}

function formatTranslationObject(obj: Record<string, unknown>): string {
  if (Object.keys(obj).length === 0) {
    return "{}";
  }

  const stringified = JSON.stringify(obj, null, 2);
  return stringified.replace(/\\"/g, '"');
}

function wrapInExport(content: string): string {
  return `export default ${content} as const;\n`;
}
