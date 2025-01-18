import { validateJobPermissions } from "@/db/queries/permissions";
import { logger, metadata, schemaTask, wait } from "@trigger.dev/sdk/v3";
import { z } from "zod";

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
    concurrencyLimit: 1,
  },
  run: async (payload, { ctx }) => {
    // Simulate translation progress with smaller steps
    const totalSteps =
      payload.targetLanguages.length * payload.content.length * 10; // 10 mini-steps per translation
    let completedSteps = 0;

    const translations: Record<
      string,
      Array<{ key: string; translatedText: string }>
    > = {};

    for (const lang of payload.targetLanguages) {
      translations[lang] = [];

      for (const item of payload.content) {
        // Split the 1 second wait into 10 smaller steps
        for (let i = 0; i < 10; i++) {
          await wait.for({ seconds: 0.1 });
          completedSteps++;
          metadata.set("progress", completedSteps / totalSteps);
        }

        translations[lang].push({
          key: item.key,
          translatedText: `Translated: ${item.sourceText}`,
        });
      }
    }

    return {
      translations,
    };
  },
});
