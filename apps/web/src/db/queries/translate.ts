import { db } from "@/db";
import { projects, translations } from "@/db/schema";
import { and, asc, desc, eq, gt } from "drizzle-orm";

export const createTranslation = async ({
  projectId,
  organizationId,
  userId,
  sourceFormat,
  translations: translationItems,
}: {
  projectId: string;
  userId: string;
  organizationId: string;
  sourceFormat: string;
  translations: {
    translationKey: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceText: string;
    translatedText: string;
    context?: string;
    branch?: string;
    commit?: string;
    commitMessage?: string;
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
      },
    })
    .returning();
};

export const getTranslationsBySlug = async ({
  limit = 10,
  slug,
  cursor,
  organizationId,
}: {
  slug: string;
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
      ),
    )
    .limit(limit)
    .orderBy(desc(translations.createdAt), asc(translations.id));
};
