import { db } from "@/db";
import { projects, translations } from "@/db/schema";
import type { DeleteKeysSchema } from "@/trpc/routers/schema";
import { and, asc, desc, eq, gt, inArray, like, or, sql } from "drizzle-orm";

export const createTranslations = async ({
  projectId,
  organizationId,
  userId,
  sourceFormat,
  translations: translationItems,
  branch,
  commit,
  sourceProvider,
  commitMessage,
  commitLink,
}: {
  projectId: string;
  userId?: string;
  organizationId: string;
  sourceFormat: string;
  branch?: string | null;
  commit?: string | null;
  sourceProvider?: string | null;
  commitMessage?: string | null;
  commitLink?: string | null;
  translations: {
    translationKey: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceText: string;
    translatedText: string;
    sourceFile: string;
  }[];
}) => {
  return db
    .insert(translations)
    .values(
      translationItems.map((translation) => ({
        projectId,
        sourceFormat,
        userId,
        organizationId,
        branch,
        commit,
        sourceProvider,
        commitMessage,
        commitLink,
        updatedAt: new Date(),
        ...translation,
      })),
    )
    .onConflictDoUpdate({
      target: [
        translations.projectId,
        translations.translationKey,
        translations.targetLanguage,
      ],
      set: {
        translatedText: translations.translatedText,
        branch,
        commit,
        commitLink,
        updatedAt: new Date(),
      },
    })
    .returning();
};

export const createDocument = async ({
  projectId,
  organizationId,
  userId,
  sourceFile,
  sourceLanguage,
  sourceText,
  targetLanguage,
  translatedText,
  sourceFormat,
  branch,
  commit,
  commitLink,
  sourceProvider,
  commitMessage,
}: {
  projectId: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  userId?: string;
  organizationId: string;
  sourceFormat: string;
  sourceFile: string;
  branch?: string | null;
  commit?: string | null;
  sourceProvider?: string | null;
  commitMessage?: string | null;
  commitLink?: string | null;
}) => {
  return db
    .insert(translations)
    .values({
      projectId,
      organizationId,
      userId,
      sourceFile,
      sourceLanguage,
      targetLanguage,
      // Document translations are stored as a single key (filename)
      translationKey: sourceFile,
      sourceType: "document",
      sourceFormat,
      sourceText,
      translatedText,
      branch,
      commit,
      commitLink,
      sourceProvider,
      commitMessage,
    })
    .onConflictDoUpdate({
      target: [
        translations.projectId,
        translations.translationKey,
        translations.targetLanguage,
      ],
      set: {
        translatedText: translations.translatedText,
        branch,
        commit,
        commitLink,
        updatedAt: new Date(),
      },
    })
    .returning();
};

export const getTranslationsBySlug = async ({
  limit = 10,
  slug,
  cursor,
  search,
  organizationId,
}: {
  slug: string;
  search?: string | null;
  cursor?: string | null;
  organizationId: string;
  limit?: number;
}) => {
  return db
    .select()
    .from(translations)
    .innerJoin(projects, eq(translations.projectId, projects.id))
    .where(
      and(
        eq(projects.slug, slug),
        eq(projects.organizationId, organizationId),
        cursor ? gt(translations.id, cursor) : undefined,
        search
          ? or(
              like(
                sql`LOWER(${translations.translationKey})`,
                `%${search.toLowerCase()}%`,
              ),
              like(
                sql`LOWER(${translations.sourceText})`,
                `%${search.toLowerCase()}%`,
              ),
            )
          : undefined,
      ),
    )
    .limit(limit)
    .orderBy(desc(translations.updatedAt), asc(translations.id));
};

export const deleteKeys = async ({ projectId, keys }: DeleteKeysSchema) => {
  return db
    .delete(translations)
    .where(
      and(
        eq(translations.projectId, projectId),
        inArray(translations.translationKey, keys),
      ),
    )
    .returning();
};
