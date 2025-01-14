import { db } from "@/db";
import { projects, translations } from "@/db/schema";
import { and, count, countDistinct, eq, gte, lte, sql } from "drizzle-orm";

export type AnalyticsData = {
  monthlyStats: {
    month: string;
    count: number;
  }[];
  totalKeys: number;
  totalLanguages: number;
};

export async function getAnalytics({
  projectSlug,
  organizationId,
  startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
  endDate = new Date(),
}: {
  projectSlug: string;
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<AnalyticsData> {
  const monthlyStats = await db
    .select({
      month:
        sql`strftime('%Y-%m', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`.as(
          "month",
        ),
      count: count(translations.translationKey),
    })
    .from(translations)
    .innerJoin(
      projects,
      and(
        eq(projects.slug, projectSlug),
        eq(projects.organizationId, organizationId),
      ),
    )
    .where(
      and(
        eq(translations.projectId, projects.id),
        gte(translations.createdAt, startDate),
        lte(translations.createdAt, endDate),
      ),
    )
    .groupBy(
      sql`strftime('%Y-%m', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`,
    )
    .orderBy(
      sql`strftime('%Y-%m', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`,
    );

  const totals = await db
    .select({
      totalKeys: count(translations.translationKey),
      totalLanguages: countDistinct(translations.targetLanguage),
    })
    .from(translations)
    .innerJoin(
      projects,
      and(
        eq(projects.slug, projectSlug),
        eq(projects.organizationId, organizationId),
      ),
    )
    .where(eq(translations.projectId, projects.id));

  return {
    monthlyStats: monthlyStats.map((stat) => ({
      month: String(stat.month),
      count: Number(stat.count),
    })),
    totalKeys: Number(totals[0]?.totalKeys ?? 0),
    totalLanguages: Number(totals[0]?.totalLanguages ?? 0),
  };
}
