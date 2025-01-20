import { getAnalytics } from "@/db/queries/analytics";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationMember } from "../permissions/organization";

export const analyticsRouter = createTRPCRouter({
  getProjectStats: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        organizationId: z.string(),
        period: z
          .enum(["monthly", "weekly", "daily"])
          .optional()
          .default("daily"),
      }),
    )
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const analytics = await getAnalytics({
        projectSlug: input.projectSlug,
        organizationId: input.organizationId,
        startDate: input.startDate,
        endDate: input.endDate,
        period: input.period,
      });

      return {
        data: analytics.data,
        totalKeys: analytics.totalKeys,
        totalLanguages: analytics.totalLanguages,
        period: analytics.period,
      };
    }),
});
