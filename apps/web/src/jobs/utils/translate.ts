import { generateObject } from "ai";
import { z } from "zod";
import { chooseModel } from "./model";
import { createFinalPrompt } from "./prompt";
import type { PromptOptions } from "./types";

function getPrompt(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
) {
  return createFinalPrompt(content, options);
}

export async function translateKeys(
  content: Array<{ key: string; sourceText: string }>,
  options: PromptOptions,
  attempt?: number,
) {
  const prompt = getPrompt(content, options);
  const model = chooseModel(attempt);

  console.log("prompt", prompt);

  console.log("Using model", {
    id: model?.model?.modelId,
    provider: model?.model?.provider,
  });

  const { object, finishReason, usage } = await generateObject({
    ...model,
    prompt,
    temperature: 0.2,
    schema: z.object({
      translatedKeys: z
        .record(
          z.string().describe("The original key from the source content"),
          z.string().describe("The translated text for this key"),
        )
        .describe("The translated content"),
    }),
  });

  console.log("finishReason", finishReason);
  console.log("usage", usage);

  return object.translatedKeys;
}

export async function translateDocument(
  content: string,
  options: PromptOptions,
  attempt?: number,
) {
  const prompt = createFinalPrompt(
    [{ key: "content", sourceText: content }],
    options,
  );
  const model = chooseModel(attempt);

  console.log("Using model", {
    id: model?.model?.modelId,
    provider: model?.model?.provider,
  });

  const { object } = await generateObject({
    ...model,
    prompt,
    temperature: 0.2,
    schema: z.object({
      translatedKeys: z
        .record(
          z.string().describe("The original key from the source content"),
          z.string().describe("The translated text for this key"),
        )
        .describe("The translated content"),
    }),
  });

  return object.translatedKeys;
}
