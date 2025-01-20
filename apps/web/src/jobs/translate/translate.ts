import { validateJobPermissions } from "@/db/queries/permissions";
import { createTranslation } from "@/db/queries/translate";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateChunkSize } from "../utils/chunk";
import { translate } from "../utils/translate";

const translationSchema = z.object({
  projectId: z.string(),
  apiKey: z.string(),
  sourceFormat: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  branch: z.string().nullable().optional(),
  commit: z.string().nullable().optional(),
  sourceProvider: z.string().nullable().optional(),
  commitMessage: z.string().nullable().optional(),
  commitLink: z.string().nullable().optional(),
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

    const chunkSize = calculateChunkSize(payload.content);

    // Split content into chunks for all languages
    const allChunks = payload.targetLanguages.flatMap((targetLocale) => {
      const contentChunks = [];
      for (let i = 0; i < payload.content.length; i += chunkSize) {
        contentChunks.push({
          targetLocale,
          chunk: payload.content.slice(i, i + chunkSize),
        });
      }
      translations[targetLocale] = [];
      return contentChunks;
    });

    // Process all chunks in parallel across all languages
    await Promise.all(
      allChunks.map(async ({ targetLocale, chunk }) => {
        metadata.set(
          "progress",
          Math.round((completedTranslations * 100) / totalTranslations),
        );

        const translatedContent = await translate(
          chunk,
          {
            sourceLocale: payload.sourceLanguage,
            targetLocale,
          },
          totalTranslations,
        );

        await createTranslation({
          projectId: payload.projectId,
          organizationId: "bhm4edxdzlgse8zik4hxwuvf",
          sourceFormat: payload.sourceFormat,
          branch: payload.branch,
          commit: payload.commit,
          sourceProvider: payload.sourceProvider,
          commitMessage: payload.commitMessage,
          commitLink: payload.commitLink,
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

    metadata.set("progress", 100);

    return {
      translations,
    };
  },
});
