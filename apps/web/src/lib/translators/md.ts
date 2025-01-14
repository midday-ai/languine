import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "./model";
import { baseRequirements, createBasePrompt } from "./prompt";
import type { PromptOptions } from "./types";

function getPrompt(base: string, options: PromptOptions) {
  const text = `
      ${baseRequirements}
      - Only translate frontmatter, and text content (including those in HTML/JSX)
      - Keep original code comments, line breaks, code, and codeblocks
      - Retain all code elements like variables, functions, and control structures
      - Respect existing whitespace and newline patterns
    `;

  return createBasePrompt(`${text}\n${base}`, options);
}

export async function markdown(strings: string[], options: PromptOptions) {
  const prompt = getPrompt(
    `Return only the translated content
            
    Source Content:
    ${strings.join("\n")}`,
    options,
  );

  const { object } = await generateObject({
    model: getModel(),
    schema: z.object({
      content: z.array(z.string()),
    }),
    prompt,
  });

  return object.content;
}
