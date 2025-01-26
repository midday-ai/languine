import { connectDb } from "@/db";
import type { AnalyticsSchema } from "@/trpc/routers/schema";
import { UTCDate } from "@date-fns/utc";
import { subDays, subMonths } from "date-fns";
import { sql } from "drizzle-orm";

export async function getAnalytics({
  projectSlug,
  organizationId,
  period = "daily",
  startDate = period === "daily"
    ? subDays(new UTCDate(), 14).toISOString() // 14 days
    : period === "weekly"
      ? subMonths(new UTCDate(), 3).toISOString() // 3 months
      : subMonths(new UTCDate(), 12).toISOString(), // 6 months
  endDate = new UTCDate().toISOString(),
}: AnalyticsSchema) {
  const db = await connectDb();

  const result = await db.execute<{
    period: string;
    key_count: number;
    document_count: number;
    total_keys: number;
    total_documents: number;
    total_languages: number;
  }>(sql`
    SELECT * FROM get_project_analytics(
      ${projectSlug},
      ${organizationId},
      ${period},
      ${startDate},
      ${endDate}
    )
  `);

  return {
    data: result.map((row) => ({
      label: row.period,
      date: row.period,
      keyCount: Number(row.key_count),
      documentCount: Number(row.document_count),
    })),
    totalKeys: Number(result[0]?.total_keys ?? 0),
    totalDocuments: Number(result[0]?.total_documents ?? 0),
    totalLanguages: Number(result[0]?.total_languages ?? 0),
    period,
  };
}
