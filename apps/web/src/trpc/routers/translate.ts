import { getTranslationsBySlug } from "@/db/queries/translate";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationMember } from "../permissions/organization";

export const translateRouter = createTRPCRouter({
  getTranslationsBySlug: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        cursor: z.string().nullish(),
        slug: z.string(),
        limit: z.number().optional(),
        search: z.string().nullish().optional(),
      }),
    )
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const data = await getTranslationsBySlug(input);

      return data.map(({ translations }) => ({
        ...translations,
        createdAt: translations.createdAt.toISOString(),
      }));
    }),
});
