import type { projectSettings } from "@/db/schema";
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

export function createTuningPrompt(
  settings: Partial<typeof projectSettings.$inferSelect>,
) {
  const tuningInstructions = [
    // Style and tone settings
    settings.formality && `- Use ${settings.formality} language style`,
    settings.toneOfVoice &&
      `- Maintain a ${settings.toneOfVoice} tone of voice`,
    settings.emotiveIntent &&
      `- Convey a ${settings.emotiveIntent} emotional tone`,

    // Brand-specific settings
    settings.brandName &&
      `- Use "${settings.brandName}" consistently for brand references`,
    settings.brandVoice &&
      `- Follow brand voice guidelines: ${settings.brandVoice}`,

    // Technical settings
    settings.lengthControl &&
      `- Apply ${settings.lengthControl} length control`,
    settings.domainExpertise &&
      `- Use terminology appropriate for ${settings.domainExpertise} domain`,
    settings.terminology &&
      `- Follow specific terminology: ${settings.terminology}`,

    // Feature flags
    settings.translationMemory &&
      "- Maintain consistency with previous translations",
    settings.qualityChecks &&
      "- Ensure high-quality output with proper grammar and spelling",
    settings.contextDetection &&
      "- Consider surrounding context for accurate translations",
    settings.inclusiveLanguage &&
      "- Use inclusive and non-discriminatory language",
    settings.idioms && "- Adapt idioms appropriately for target culture",
  ]
    .filter(Boolean)
    .join("\n");

  return tuningInstructions
    ? `\nAdditional Requirements:\n${tuningInstructions}`
    : "";
}
