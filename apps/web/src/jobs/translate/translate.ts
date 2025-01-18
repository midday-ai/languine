import { validateJobPermissions } from "@/db/queries/permissions";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { translate } from "../utils/translate";

const translationSchema = z.object({
  projectId: z.string(),
  apiKey: z.string(),
  sourceFormat: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  content: z.array(
    z.object({
      key: z.string(),
      sourceText: z.string(),
    }),
  ),
});

export const translateTask = schemaTask({
  id: "translate",
  schema: translationSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload, { ctx }) => {
    // Validate permissions
    // await validateJobPermissions(payload.projectId, payload.apiKey);

    const translations: Record<
      string,
      Array<{ key: string; translatedText: string }>
    > = {};

    const totalTranslations =
      payload.targetLanguages.length * payload.content.length;
    let completedTranslations = 0;

    metadata.set("progress", 0);

    // Run translations in parallel for each target language
    await Promise.all(
      payload.targetLanguages.map(async (targetLocale) => {
        translations[targetLocale] = [];

        // Update progress before starting each language
        metadata.set(
          "progress",
          Math.round((completedTranslations * 100) / totalTranslations),
        );

        const translatedContent = await translate(payload.content, {
          sourceLocale: payload.sourceLanguage,
          targetLocale,
        });

        for (let i = 0; i < payload.content.length; i++) {
          translations[targetLocale].push({
            key: payload.content[i].key,
            translatedText: translatedContent[i],
          });

          completedTranslations++;

          // Update progress after each individual translation
          const progress = Math.round(
            (completedTranslations * 100) / totalTranslations,
          );
          metadata.set("progress", progress);

          // Add micro-progress updates between translations
          if (i < payload.content.length - 1) {
            metadata.set("progress", progress + 0.5);
          }
        }
      }),
    );

    metadata.set("progress", 100);

    return {
      translations,
    };
  },
});
