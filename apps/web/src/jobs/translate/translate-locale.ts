import { createDocument, createTranslations } from "@/db/queries/translate";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { translateDocument, translateKeys } from "../utils/translate";

const translateLocaleSchema = z.object({
  projectId: z.string(),
  organizationId: z.string(),
  apiKey: z.string(),
  sourceFormat: z.string(),
  sourceLanguage: z.string(),
  targetLocale: z.string(),
  branch: z.string().nullable().optional(),
  commit: z.string().nullable().optional(),
  sourceProvider: z.string().nullable().optional(),
  commitMessage: z.string().nullable().optional(),
  commitLink: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  content: z.array(
    z.object({
      key: z.string(),
      sourceText: z.string(),
      sourceFile: z.string(),
    }),
  ),
  chunkSize: z.number(),
});

export const translateLocaleTask = schemaTask({
  id: "translate-locale",
  schema: translateLocaleSchema,
  maxDuration: 600,
  run: async (payload) => {
    const translations: Array<{ key: string; translatedText: string }> = [];

    // If the source format is markdown, we take the whole document and translate it
    if (payload.sourceFormat === "md" || payload.sourceFormat === "mdx") {
      const document = payload.content.at(0);

      if (!document?.sourceText) {
        return {
          translations: [],
          targetLocale: payload.targetLocale,
          status: "completed",
          progress: 100,
        };
      }

      const translatedContent = await translateDocument(document.sourceText, {
        sourceLocale: payload.sourceLanguage,
        targetLocale: payload.targetLocale,
        sourceFormat: payload.sourceFormat,
      });

      translations.push({
        key: "content",
        translatedText: translatedContent,
      });

      if (document?.sourceText) {
        await createDocument({
          projectId: payload.projectId,
          organizationId: payload.organizationId,
          sourceText: document.sourceText,
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLocale,
          translatedText: translatedContent,
          sourceFile: document.sourceFile,
          sourceFormat: payload.sourceFormat,
          branch: payload.branch,
          commit: payload.commit,
          commitLink: payload.commitLink,
          sourceProvider: payload.sourceProvider,
          commitMessage: payload.commitMessage,
          userId: payload.userId,
        });
      }

      return {
        translations,
        targetLocale: payload.targetLocale,
      };
    }

    // Split content into chunks
    const contentChunks = [];
    for (let i = 0; i < payload.content.length; i += payload.chunkSize) {
      contentChunks.push(payload.content.slice(i, i + payload.chunkSize));
    }

    let completedChunks = 0;
    const totalChunks = contentChunks.length;

    // Process chunks sequentially
    for (const chunk of contentChunks) {
      const translatedContent = await translateKeys(
        chunk,
        {
          sourceLocale: payload.sourceLanguage,
          targetLocale: payload.targetLocale,
        },
        totalChunks,
      );

      await createTranslations({
        projectId: payload.projectId,
        organizationId: payload.organizationId,
        sourceFormat: payload.sourceFormat,
        branch: payload.branch,
        commit: payload.commit,
        sourceProvider: payload.sourceProvider,
        commitMessage: payload.commitMessage,
        commitLink: payload.commitLink,
        userId: payload.userId,
        translations: chunk.map((content, i) => ({
          translationKey: content.key,
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLocale,
          sourceText: content.sourceText,
          sourceFile: content.sourceFile,
          translatedText: translatedContent[i],
        })),
      });

      // Process translations for this chunk
      chunk.forEach((content, i) => {
        translations.push({
          key: content.key,
          translatedText: translatedContent[i],
        });
      });

      completedChunks++;
    }

    return {
      translations,
      targetLocale: payload.targetLocale,
    };
  },
});
