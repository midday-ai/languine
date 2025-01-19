import { flatten, unflatten } from "../core/flatten.ts";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createJavaScriptParser(): Parser {
  return createFormatParser({
    async parse(input: string) {
      try {
        const cleanInput = preprocessInput(input);
        const parsed = evaluateJavaScript(cleanInput);
        validateParsedObject(parsed);
        return flatten(parsed);
      } catch (error) {
        throw new Error(
          `Failed to parse JavaScript/TypeScript translations: ${(error as Error).message}`,
        );
      }
    },

    async serialize(_, data) {
      const nested = unflatten(data);
      const formatted = formatTranslationObject(nested);
      return wrapInExport(formatted);
    },
  });
}

function preprocessInput(input: string): string {
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

function formatTranslationObject(obj: Record<string, unknown>): string {
  return formatObjectLiteral(obj, 0);
}

function formatObjectLiteral(
  obj: Record<string, unknown>,
  indent: number,
): string {
  if (Object.keys(obj).length === 0) {
    return "{}";
  }

  const indentStr = "  ".repeat(indent);
  const innerIndentStr = "  ".repeat(indent + 1);

  const entries = Object.entries(obj).map(([key, value]) => {
    const formattedKey = needsQuotes(key) ? `"${key}"` : key;
    const formattedValue =
      typeof value === "object" && value !== null
        ? formatObjectLiteral(value as Record<string, unknown>, indent + 1)
        : `"${String(value).replace(/"/g, '\\"')}"`;
    return `${innerIndentStr}${formattedKey}: ${formattedValue}`;
  });

  return `{\n${entries.join(",\n")}\n${indentStr}}`;
}

function needsQuotes(key: string): boolean {
  return (
    /[^a-zA-Z0-9_$]/.test(key) ||
    /^\d/.test(key) ||
    key.includes(".") ||
    !isValidIdentifier(key)
  );
}

function isValidIdentifier(key: string): boolean {
  try {
    new Function(`const ${key} = 0;`);
    return true;
  } catch {
    return false;
  }
}

function wrapInExport(content: string): string {
  return `export default ${content} as const;\n`;
}
