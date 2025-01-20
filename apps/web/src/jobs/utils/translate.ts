import { generateObject } from "ai";
import { z } from "zod";
import { chooseModel } from "./model";
import { createFinalPrompt } from "./prompt";
import type { PromptOptions } from "./types";

function getPrompt(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
) {
  const codeblocks = content
    .map(({ sourceText }) => {
      return `\`\`\`json
${sourceText}
\`\`\``;
    })
    .join("\n\n");

  return createFinalPrompt(codeblocks, options);
}

export async function translate(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
  totalItems: number,
) {
  const prompt = getPrompt(content, options);

  const { object } = await generateObject({
    model: chooseModel(totalItems),
    prompt,
    mode: "json",
    maxTokens: 8000,
    schema: z.object({
      content: z.array(z.string()),
    }),
  });

  return object.content;
}
