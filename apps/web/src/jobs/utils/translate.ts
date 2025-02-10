import { NoObjectGeneratedError, generateObject } from "ai";
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

  try {
    const { object, finishReason, usage } = await generateObject({
      ...model,
      prompt,
      temperature: 0.2,
      mode: "json",
      schema: z.object({
        translatedKeys: z
          .array(
            z.string().describe("The original key from the source content"),
          )
          .describe("The translated content"),
      }),
    });

    console.log("finishReason", finishReason);
    console.log("usage", usage);

    return object.translatedKeys;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.log("NoObjectGeneratedError");
      console.log("Cause:", error.cause);
      console.log("Text:", error.text);
      console.log("Response:", error.response);
      console.log("Usage:", error.usage);
    }

    throw error;
  }
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

  try {
    const { object } = await generateObject({
      ...model,
      prompt,
      temperature: 0.2,
      mode: "json",
      schema: z.object({
        translatedKeys: z
          .array(
            z.string().describe("The original key from the source content"),
          )
          .describe("The translated content"),
      }),
    });

    return object.translatedKeys;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.log("NoObjectGeneratedError");
      console.log("Cause:", error.cause);
      console.log("Text:", error.text);
      console.log("Response:", error.response);
      console.log("Usage:", error.usage);
    }
    throw error;
  }
}
