import { createDocument } from "@/db/queries/documents";
import { validateJobPermissions } from "@/db/queries/permissions";
import { createTranslation } from "@/db/queries/translate";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateChunkSize } from "../utils/chunk";
import { translateDocument, translateKeys } from "../utils/translate";

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
      documentName: z.string().nullable().optional(),
    }),
  ),
});

export const translateTask = schemaTask({
  id: "translate",
  schema: translationSchema,
  maxDuration: 600,
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload) => {
    const { project } = await validateJobPermissions({
      projectId: payload.projectId,
      apiKey: payload.apiKey,
    });

    if (!project) {
      throw new Error("Permission denied");
    }

    const translations: Record<
      string,
      Array<{ key: string; translatedText: string }>
    > = {};

    // If the source format is markdown, we take the whole document and translate it
    if (payload.sourceFormat === "md") {
      for (const targetLocale of payload.targetLanguages) {
        const document = payload.content.at(0);

        if (!document?.sourceText) {
          continue;
        }

        const translatedContent = await translateDocument(document.sourceText, {
          sourceLocale: payload.sourceLanguage,
          targetLocale,
        });

        translations[targetLocale] = [
          {
            key: "content",
            translatedText: translatedContent,
          },
        ];

        if (document?.sourceText) {
          await createDocument({
            projectId: project.id,
            organizationId: project.organizationId,
            sourceText: document.sourceText,
            sourceLanguage: payload.sourceLanguage,
            targetLanguage: targetLocale,
            translatedText: translatedContent,
            sourceFormat: payload.sourceFormat,
            name: document.documentName ?? "",
          });
        }
      }

      return {
        translations,
      };
    }

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

        const translatedContent = await translateKeys(
          chunk,
          {
            sourceLocale: payload.sourceLanguage,
            targetLocale,
          },
          totalTranslations,
        );

        await createTranslation({
          projectId: project.id,
          organizationId: project.organizationId,
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
