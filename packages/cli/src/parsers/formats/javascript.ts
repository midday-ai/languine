import { flatten, unflatten } from "../core/flatten.ts";
import { createFormatParser } from "../core/format.ts";
import type { Parser } from "../core/types.ts";

export function createJavaScriptParser(): Parser {
  return createFormatParser({
    async parse(input: string): Promise<Record<string, string>> {
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

    async serialize(data: Record<string, string>): Promise<string> {
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
  const jsonString = JSON.stringify(obj, null, 2);
  return jsonString.replace(/\\"/g, '"');
}

function wrapInExport(content: string): string {
  return `export default ${content} as const;\n`;
}
