import { getAnalytics } from "@/db/queries/analytics";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const analyticsRouter = createTRPCRouter({
  getProjectStats: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        organizationId: z.string(),
      }),
    )
    // .use(isProjectMember)
    .query(async ({ input }) => {
      const analytics = await getAnalytics({
        projectSlug: input.projectSlug,
        organizationId: input.organizationId,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      return {
        monthlyStats: analytics.monthlyStats,
        totalKeys: analytics.totalKeys,
        totalLanguages: analytics.totalLanguages,
      };
    }),
});
