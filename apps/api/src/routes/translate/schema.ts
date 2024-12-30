import { z } from "zod";

export const translationBaseSchema = z.object({
  sourceLocale: z.string(),
  targetLocale: z.string(),
});

export const batchTranslationSchema = z.object({
  sourceLocale: z.string(),
  targetLocales: z.array(z.string()),
  fast: z.boolean().optional(),
});

export const textSchema = z.object({
  text: z.string(),
  ...translationBaseSchema.shape,
});

export const batchTextSchema = z.object({
  text: z.string(),
  ...batchTranslationSchema.shape,
});

export const objectSchema = z.object({
  content: z.record(z.string()),
  ...translationBaseSchema.shape,
});

export const chatMessageSchema = z.object({
  name: z.string(),
  text: z.string(),
});

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema),
  ...translationBaseSchema.shape,
});

export const recognizeSchema = z.object({
  text: z.string(),
});
