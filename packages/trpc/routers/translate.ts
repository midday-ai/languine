import { deleteKeys, getTranslationsBySlug } from "@/db/queries/translate";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";
import { isOrganizationMember } from "../permissions/organization";
import { hasProjectAccess } from "../permissions/project";
import { deleteKeysSchema, translateSchema } from "./schema";

export const translateRouter = createTRPCRouter({
  getTranslationsBySlug: protectedProcedure
    .input(translateSchema)
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const data = await getTranslationsBySlug(input);

      return data.map(({ translations }) => ({
        ...translations,
        createdAt: translations.createdAt.toISOString(),
      }));
    }),

  deleteKeys: protectedProcedure
    .use(rateLimitMiddleware)
    .input(deleteKeysSchema)
    .use(hasProjectAccess)
    .mutation(async ({ input }) => {
      const data = await deleteKeys(input);

      return data;
    }),
});
