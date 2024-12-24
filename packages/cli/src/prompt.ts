import dedent from "dedent";
import type { PromptOptions } from "./types.js";

export function createBasePrompt(text: string, options: PromptOptions) {
  return dedent`
        You are a professional translator working with ${options.format.toUpperCase()} files.
            
        Task: Translate the content below from ${options.contentLocale} to ${options.targetLocale}.
        ${options.config.instructions ?? ""}
        ${text}
    `;
}

/**
 * Create prompt for record-like objects
 */
export function createRecordPrompt(
  parsedContent: Record<string, string>,
  options: PromptOptions,
) {
  return createBasePrompt(
    `
    Translation Requirements:
    - Maintain exact file structure, indentation, and formatting
    - Only translate text content within quotation marks
    - Preserve all object/property keys, syntax characters, and punctuation marks exactly
    - Keep consistent capitalization, spacing, and line breaks
    - Provide natural, culturally-adapted translations that sound native
    - Retain all code elements like variables, functions, and control structures
    - Exclude any translator notes, comments or explanatory text
    - Match source file's JSON/object structure precisely
    - Handle special characters and escape sequences correctly
    - Respect existing whitespace and newline patterns
    - Keep all technical identifiers unchanged
    - Translate only user-facing strings
    - Never add space before a ! or ?

    Source content:
    ${JSON.stringify(parsedContent, null, 2)}

    Return only the translated content with identical structure.
    `,
    options,
  );
}
