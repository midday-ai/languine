import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { createFinalPrompt } from "./prompt";
import type { PromptOptions } from "./types";

const openai = createOpenAI({
  baseURL: process.env.AI_GATEWAY_ENDPOINT,
  apiKey: process.env.AI_API_KEY,
});

function getPrompt(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
) {
  const codeblocks = content
    .map(({ key, sourceText }) => {
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
) {
  const prompt = getPrompt(content, options);

  const { object } = await generateObject({
    model: openai("deepseek-chat"),
    prompt,
    mode: "json",
    maxTokens: 8000,
    schema: z.object({
      content: z.array(z.string()),
    }),
  });

  return object.content;
}
