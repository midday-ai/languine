import { getAnalytics } from "@/db/queries/analytics";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationMember } from "../permissions/organization";
import { analyticsSchema } from "./schema";

export const analyticsRouter = createTRPCRouter({
  getProjectStats: protectedProcedure
    .input(analyticsSchema)
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
