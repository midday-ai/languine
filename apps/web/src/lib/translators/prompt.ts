import type { PromptOptions } from "./types";

export const baseRequirements = `
Translation Requirements:
- Maintain exact file structure, indentation, and formatting
- Provide natural, culturally-adapted translations that sound native
- Keep all technical identifiers unchanged
- Keep consistent capitalization, spacing, and line breaks
- Respect existing whitespace and newline patterns
`;

export function createBasePrompt(text: string, options: PromptOptions) {
  return `You are a professional translator working with ${options.format.toUpperCase()} files.

Task: Translate the content below from ${options.contentLocale} to ${options.targetLocale}.
${text}`;
}
