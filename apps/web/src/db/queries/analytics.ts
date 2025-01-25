import { connectDb } from "@/db";
import { projects, translations } from "@/db/schema";
import type { AnalyticsSchema } from "@/trpc/routers/schema";
import { UTCDate } from "@date-fns/utc";
import { format, startOfWeek, subDays, subMonths } from "date-fns";
import { and, count, countDistinct, eq, gte, lte, sql } from "drizzle-orm";

export async function getAnalytics({
  projectSlug,
  organizationId,
  period = "daily",
  startDate = period === "daily"
    ? subDays(new UTCDate(), 14) // 14 days
    : period === "weekly"
      ? subMonths(new UTCDate(), 3) // 3 months
      : subMonths(new UTCDate(), 12), // 6 months
  endDate = new UTCDate(),
}: AnalyticsSchema) {
  const db = await connectDb();

  let dateFormat: string;
  let intervalStr: string;

  switch (period) {
    case "monthly":
      dateFormat = "YYYY-MM";
      intervalStr = "1 month";
      break;
    case "weekly":
      dateFormat = "YYYY-WW";
      intervalStr = "7 days";
      break;
    default:
      dateFormat = "YYYY-MM-DD";
      intervalStr = "1 day";
      break;
  }

  // Generate all dates in range
  const dates = [];
  let currentDate = period === "weekly" ? startOfWeek(startDate) : startDate;

  while (currentDate <= endDate) {
    const formattedDate =
      period === "weekly"
        ? format(currentDate, "yyyy-'W'ww")
        : period === "monthly"
          ? currentDate
              .toISOString()
              .slice(0, 7) // YYYY-MM
          : currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

    dates.push({ period: formattedDate, date: currentDate });

    // Advance to next period
    const nextDate = new UTCDate(currentDate);
    switch (period) {
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    currentDate = nextDate;
  }

  const periodSql =
    period === "weekly"
      ? sql`to_char(${translations.updatedAt}::timestamp without time zone, 'YYYY-"W"WW')`
      : sql`to_char(${translations.updatedAt}::timestamp without time zone, ${dateFormat})`;

  const [keyStats, documentStats, totals] = await Promise.all([
    // Get key stats by period
    db
      .select({
        period: periodSql.as("period"),
        keyCount: count().as("keyCount"),
        updatedAt: translations.updatedAt,
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
          eq(translations.sourceType, "key"),
          gte(translations.updatedAt, startDate),
          lte(translations.updatedAt, endDate),
        ),
      )
      .groupBy(periodSql, translations.updatedAt)
      .orderBy(periodSql),

    // Get document stats by period
    db
      .select({
        period: periodSql.as("period"),
        documentCount: count().as("documentCount"),
        updatedAt: translations.updatedAt,
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
          eq(translations.sourceType, "document"),
          gte(translations.updatedAt, startDate),
          lte(translations.updatedAt, endDate),
        ),
      )
      .groupBy(periodSql, translations.updatedAt)
      .orderBy(periodSql),

    // Get overall totals
    db
      .select({
        totalKeys: count().as("totalKeys"),
        totalDocuments: count().as("totalDocuments"),
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
      .where(
        and(
          eq(translations.projectId, projects.id),
          sql`(
            (${translations.sourceType} = 'key' AND ${translations.translationKey} IS NOT NULL) OR
            (${translations.sourceType} = 'document' AND ${translations.translationKey} IS NOT NULL)
          )`,
        ),
      ),
  ]);

  // Create maps of existing stats
  const keyStatsMap = new Map(
    keyStats.map((stat) => [stat.period, stat.keyCount]),
  );
  const documentStatsMap = new Map(
    documentStats.map((stat) => [stat.period, stat.documentCount]),
  );

  // Combine with all dates, using 0 for missing values
  return {
    data: dates.map((date) => ({
      label: String(date.period),
      date: date.period,
      keyCount: Number(keyStatsMap.get(date.period) ?? 0),
      documentCount: Number(documentStatsMap.get(date.period) ?? 0),
    })),
    totalKeys: Number(totals[0]?.totalKeys ?? 0),
    totalDocuments: Number(totals[0]?.totalDocuments ?? 0),
    totalLanguages: Number(totals[0]?.totalLanguages ?? 0),
    period,
  };
}
