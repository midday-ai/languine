import { createOpenAI } from "@ai-sdk/openai";

export function getModels() {
  const createPrimaryModel = createOpenAI({
    baseURL: process.env.AI_PRIMARY_ENDPOINT,
    apiKey: process.env.AI_PRIMARY_API_KEY,
  });

  const createSecondaryModel = createOpenAI({
    baseURL: process.env.AI_SECONDARY_ENDPOINT,
    apiKey: process.env.AI_SECONDARY_API_KEY,
  });

  const createTertiaryModel = createOpenAI({
    baseURL: process.env.AI_TERTIARY_ENDPOINT,
    apiKey: process.env.AI_TERTIARY_API_KEY,
  });

  const createQuaternaryModel = createOpenAI({
    baseURL: process.env.AI_QUATERNARY_ENDPOINT,
    apiKey: process.env.AI_QUATERNARY_API_KEY,
  });

  return {
    primary: createPrimaryModel(process.env.AI_PRIMARY_MODEL!),
    secondary: createSecondaryModel(process.env.AI_SECONDARY_MODEL!),
    tertiary: createTertiaryModel(process.env.AI_TERTIARY_MODEL!),
    quaternary: createQuaternaryModel(process.env.AI_QUATERNARY_MODEL!),
  };
}

export function chooseModel(attempt?: number) {
  const models = getModels();

  // Choose model based on attempt count
  switch (attempt) {
    case 1:
      return {
        model: models.primary,
        mode: "json",
        maxTokens: 8000,
      };
    case 2:
      return {
        model: models.secondary,
        mode: "json",
        maxTokens: 4000,
      };
    case 3:
      return {
        model: models.tertiary,
        mode: "json",
        maxTokens: 8000,
      };
    case 4:
      return {
        model: models.quaternary,
        mode: "json",
        maxTokens: 8000,
      };
    default:
      return {
        model: models.primary,
        mode: "json",
        maxTokens: 8000,
      };
  }
}
