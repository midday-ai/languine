import { db } from "@/db";
import { projects, translations } from "@/db/schema";
import type { AnalyticsSchema } from "@/trpc/routers/schema";
import { format, startOfWeek, subDays, subMonths } from "date-fns";
import { and, count, countDistinct, eq, gte, lte, sql } from "drizzle-orm";

export async function getAnalytics({
  projectSlug,
  organizationId,
  period = "daily",
  startDate = period === "daily"
    ? subDays(new Date(), 14) // 14 days
    : period === "weekly"
      ? subMonths(new Date(), 3) // 3 months
      : subMonths(new Date(), 12), // 6 months
  endDate = new Date(),
}: AnalyticsSchema) {
  let dateFormat: string;
  let intervalStr: string;

  switch (period) {
    case "monthly":
      dateFormat = "%Y-%m";
      intervalStr = "1 month";
      break;
    case "weekly":
      dateFormat = "%Y-%W";
      intervalStr = "7 days";
      break;
    default:
      dateFormat = "%Y-%m-%d";
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

    dates.push({ period: formattedDate });

    // Advance to next period
    const nextDate = new Date(currentDate);
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

  const stats = await db
    .select({
      period:
        period === "weekly"
          ? sql`strftime('%Y-W%W', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`.as(
              "period",
            )
          : sql`strftime('${sql.raw(dateFormat)}', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`.as(
              "period",
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
      period === "weekly"
        ? sql`strftime('%Y-W%W', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`
        : sql`strftime('${sql.raw(dateFormat)}', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`,
    )
    .orderBy(
      period === "weekly"
        ? sql`strftime('%Y-W%W', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`
        : sql`strftime('${sql.raw(dateFormat)}', datetime(${translations.createdAt}, 'unixepoch', 'localtime'))`,
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

  // Create a map of existing stats
  const statsMap = new Map(stats.map((stat) => [stat.period, stat.count]));

  // Combine with all dates, using 0 for missing values
  return {
    data: dates.map((date) => ({
      label: String(date.period),
      count: Number(statsMap.get(date.period) ?? 0),
    })),
    totalKeys: Number(totals[0]?.totalKeys ?? 0),
    totalLanguages: Number(totals[0]?.totalLanguages ?? 0),
    period,
  };
}
