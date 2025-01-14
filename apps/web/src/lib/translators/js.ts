import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "./model";
import { createBasePrompt } from "./prompt";
import { baseRequirements } from "./prompt";
import type { PromptOptions } from "./types";

function getPrompt(strings: string[], options: PromptOptions) {
  const text = `
      ${baseRequirements}
      - Preserve all object/property keys, syntax characters, and punctuation marks exactly
      - Only translate text content within quotation marks
      - Only return the translations in a JSON array of strings as the schema requires and not as enum values
      
      A list of javascript strings to translate. Return the translations in a JSON array of strings:`;

  const codeblocks = strings
    .map((v) => {
      return `\`\`\`${options.format}\n${v}\n\`\`\``;
    })
    .join("\n\n");

  return createBasePrompt(`${text}\n${codeblocks}`, options);
}

export async function javascript(strings: string[], options: PromptOptions) {
  const prompt = getPrompt(strings, options);

  const { object } = await generateObject({
    model: getModel(),
    prompt,
    schema: z.object({
      content: z.array(z.string()),
    }),
  });

  return object.content;
}
