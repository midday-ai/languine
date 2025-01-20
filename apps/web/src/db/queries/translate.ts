import { db } from "@/db";
import { projects, translations } from "@/db/schema";
import { and, asc, desc, eq, gt, ilike, like, or, sql } from "drizzle-orm";

export const createTranslation = async ({
  projectId,
  organizationId,
  userId,
  sourceFormat,
  translations: translationItems,
}: {
  projectId: string;
  userId?: string;
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
    .orderBy(desc(translations.createdAt), asc(translations.id));
};
