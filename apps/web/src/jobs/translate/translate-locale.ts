import { primaryDb } from "@/db";
import {
  createDocument,
  createTranslations,
  getOverridesForLocale,
} from "@/db/queries/translate";
import { translations as translationsTable } from "@/db/schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { calculateChunkSize } from "../utils/chunk";
import { chooseModel } from "../utils/model";
import { translateDocument, translateKeys } from "../utils/translate";

interface TranslationResult {
  key: string;
  translatedText: string;
}

interface Translation {
  projectId: string;
  translationKey: string;
  targetLanguage: string;
  translatedText: string;
  overridden: boolean;
}

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
});

export const translateLocaleTask = schemaTask({
  id: "translate-locale",
  schema: translateLocaleSchema,
  maxDuration: 600,
  queue: {
    // Global limit for all tasks we need 50 RPS
    concurrencyLimit: 50,
  },
  retry: {
    maxAttempts: 4,
  },
  run: async (payload, { ctx }) => {
    const translations: TranslationResult[] = [];
    const model = chooseModel(ctx.attempt.number);
    const chunkSize = calculateChunkSize(payload.content, model.model.modelId);

    // If the source format is markdown, we take the whole document and translate it
    if (payload.sourceFormat === "md" || payload.sourceFormat === "mdx") {
      const document = payload.content.at(0);

      if (!document?.sourceText) {
        return {
          translations: [],
          targetLocale: payload.targetLocale,
        };
      }

      const translatedContent = await translateDocument(
        document.sourceText,
        {
          sourceLocale: payload.sourceLanguage,
          targetLocale: payload.targetLocale,
          sourceFormat: payload.sourceFormat,
        },
        ctx.attempt.number,
      );

      translations.push({
        key: "content",
        translatedText: translatedContent.content,
      });

      if (document?.sourceText) {
        await createDocument({
          projectId: payload.projectId,
          organizationId: payload.organizationId,
          sourceText: document.sourceText,
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLocale,
          translatedText: translatedContent.content,
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

    // Get all overrides for this locale upfront
    const overrides = await getOverridesForLocale({
      projectId: payload.projectId,
      targetLanguage: payload.targetLocale,
      translationKeys: payload.content.map((c) => c.key),
    });

    // Add overrides to translations result
    for (const override of overrides) {
      translations.push({
        key: override.translationKey,
        translatedText: override.translatedText,
      });
    }

    // Filter out overridden keys from content
    const nonOverriddenContent = payload.content.filter(
      (content) => !overrides.some((o) => o.translationKey === content.key),
    );

    // Split remaining content into chunks
    const contentChunks = [];
    for (let i = 0; i < nonOverriddenContent.length; i += chunkSize) {
      contentChunks.push(nonOverriddenContent.slice(i, i + chunkSize));
    }

    let completedChunks = 0;

    // Process chunks sequentially
    for (const chunk of contentChunks) {
      let translatedContent = await translateKeys(
        chunk,
        {
          sourceLocale: payload.sourceLanguage,
          targetLocale: payload.targetLocale,
        },
        ctx.attempt.number,
      );

      // Find keys with null values and retry once with remaining keys
      const remainingKeys = chunk.filter(
        (content) => !translatedContent[content.key],
      );

      if (remainingKeys.length > 0) {
        const retryTranslations = await translateKeys(
          remainingKeys,
          {
            sourceLocale: payload.sourceLanguage,
            targetLocale: payload.targetLocale,
          },
          ctx.attempt.number,
        );
        translatedContent = { ...translatedContent, ...retryTranslations };
      }

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
        translations: chunk.map((content) => ({
          translationKey: content.key,
          sourceLanguage: payload.sourceLanguage,
          targetLanguage: payload.targetLocale,
          sourceText: content.sourceText,
          sourceFile: content.sourceFile,
          translatedText: translatedContent[content.key],
        })),
      });

      // Process translations for this chunk
      for (const content of chunk) {
        translations.push({
          key: content.key,
          translatedText: translatedContent[content.key],
        });
      }

      completedChunks++;
    }

    return {
      translations,
      targetLocale: payload.targetLocale,
    };
  },
});
