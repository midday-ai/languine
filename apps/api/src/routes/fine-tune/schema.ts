import z from "zod";
import "zod-openapi/extend";

export const fineTuneBodySchema = z
  .object({
    instructions: z.string().openapi({
      description: "Instructions text to fine-tune the model with",
      example:
        "You are a helpful translator assistant. You maintain a professional yet approachable tone, and excel at preserving both meaning and cultural context when translating between languages. You provide clear explanations for idiomatic expressions and cultural references.",
    }),
  })
  .openapi({ ref: "FineTuneBody" });

export const fineTuneResponseSchema = z
  .object({
    data: z.string().openapi({
      description: "Response message from fine-tuning",
      example: "Fine tuned model!",
    }),
  })
  .openapi({ ref: "FineTuneResponse" });
