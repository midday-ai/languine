import { validateJobPermissions } from "@/db/queries/permissions";
import { createTranslation } from "@/db/queries/translate";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { translate } from "../utils/translate";

// Calculate chunk size based on input length to stay under 4k tokens
function calculateChunkSize(
  content: Array<{ key: string; sourceText: string }>,
) {
  const MAX_TOKENS = 4000;
  const AVERAGE_CHARS_PER_TOKEN = 4; // Rough estimate

  // Calculate total characters in content
  const totalChars = content.reduce(
    (sum, item) => sum + item.sourceText.length,
    0,
  );
  const estimatedTokens = totalChars / AVERAGE_CHARS_PER_TOKEN;

  // Calculate how many items we can fit in a chunk
  const itemsPerChunk = Math.max(
    1,
    Math.floor((MAX_TOKENS / estimatedTokens) * content.length),
  );
  return itemsPerChunk;
}

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
    // const { type, org, project } = await validateJobPermissions({
    //   projectId: payload.projectId,
    //   apiKey: payload.apiKey,
    // });

    const translations: Record<
      string,
      Array<{ key: string; translatedText: string }>
    > = {};

    const totalTranslations =
      payload.targetLanguages.length * payload.content.length;
    let completedTranslations = 0;

    metadata.set("progress", 0);

    // Process all target languages in parallel
    await Promise.all(
      payload.targetLanguages.map(async (targetLocale) => {
        translations[targetLocale] = [];

        const chunkSize = calculateChunkSize(payload.content);

        // Split content into chunks
        const contentChunks = [];
        for (let i = 0; i < payload.content.length; i += chunkSize) {
          contentChunks.push(payload.content.slice(i, i + chunkSize));
        }

        // Process chunks in parallel for current language
        await Promise.all(
          contentChunks.map(async (chunk, chunkIndex) => {
            // Update progress before starting chunk
            metadata.set(
              "progress",
              Math.round((completedTranslations * 100) / totalTranslations),
            );

            const translatedContent = await translate(chunk, {
              sourceLocale: payload.sourceLanguage,
              targetLocale,
            });

            console.log(translatedContent);

            await createTranslation({
              projectId: payload.projectId,
              organizationId: "bhm4edxdzlgse8zik4hxwuvf",
              sourceFormat: payload.sourceFormat,
              translations: chunk.map((content, i) => ({
                translationKey: content.key,
                sourceLanguage: payload.sourceLanguage,
                targetLanguage: targetLocale,
                sourceText: content.sourceText,
                translatedText: translatedContent[i],
              })),
            });

            // Process translations for this chunk
            chunk.forEach((content, i) => {
              translations[targetLocale].push({
                key: content.key,
                translatedText: translatedContent[i],
              });

              completedTranslations++;

              // Update progress after each translation
              const progress = Math.round(
                (completedTranslations * 100) / totalTranslations,
              );
              metadata.set("progress", progress);
            });
          }),
        );
      }),
    );

    metadata.set("progress", 100);

    return {
      translations,
    };
  },
});
