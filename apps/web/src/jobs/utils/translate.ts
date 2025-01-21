import { generateObject } from "ai";
import { z } from "zod";
import { chooseModel, getModels } from "./model";
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

export async function translateKeys(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
  totalItems: number,
) {
  const prompt = getPrompt(content, options);

  const { object } = await generateObject({
    ...chooseModel(totalItems),
    prompt,
    schema: z.object({
      content: z.array(z.string()),
    }),
  });

  return object.content;
}

export async function translateDocument(
  content: string,
  options: PromptOptions,
) {
  const { large } = getModels();
  const prompt = createFinalPrompt(content, options);

  const { object } = await generateObject({
    model: large,
    prompt,
    schema: z.object({
      content: z.string(),
    }),
  });

  return object.content;
}
