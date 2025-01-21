import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, asc, desc, eq, gt, like, sql } from "drizzle-orm";

export async function getDocuments({
  limit = 10,
  cursor,
  search,
  projectId,
  organizationId,
}: {
  projectId: string;
  search?: string | null;
  cursor?: string | null;
  organizationId: string;
  limit?: number;
}) {
  return db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.projectId, projectId),
        eq(documents.organizationId, organizationId),
        cursor ? gt(documents.id, cursor) : undefined,
        search
          ? like(sql`LOWER(${documents.name})`, `%${search.toLowerCase()}%`)
          : undefined,
      ),
    )
    .limit(limit)
    .orderBy(desc(documents.updatedAt), asc(documents.id));
}

export async function createDocument({
  projectId,
  organizationId,
  userId,
  sourceFormat,
  name,
  branch,
  commit,
  sourceProvider,
  commitMessage,
  sourceText,
  sourceLanguage,
  targetLanguage,
  translatedText,
  commitLink,
}: {
  projectId: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  userId?: string;
  organizationId: string;
  sourceFormat: string;
  name: string;
  branch?: string | null;
  commit?: string | null;
  sourceProvider?: string | null;
  commitMessage?: string | null;
  commitLink?: string | null;
}) {
  const [document] = await db
    .insert(documents)
    .values({
      projectId,
      organizationId,
      userId,
      sourceFormat,
      name,
      branch,
      commit,
      sourceProvider,
      commitMessage,
      commitLink,
      sourceText,
      sourceLanguage,
      targetLanguage,
      translatedText,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [documents.projectId, documents.name, documents.targetLanguage],
      set: {
        translatedText: documents.translatedText,
        branch,
        commit,
        commitLink,
        updatedAt: new Date(),
      },
    })
    .returning();

  return document;
}
