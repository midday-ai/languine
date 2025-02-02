import {
  deleteKeys,
  getProjectLocales,
  getTranslationsByKey,
  getTranslationsBySlug,
} from "@/db/queries/translate";
import { createTRPCRouter, protectedProcedure } from "../init";
import { isOrganizationMember } from "../permissions/organization";
import { hasProjectAccess } from "../permissions/project";
import {
  deleteKeysSchema,
  projectLocalesSchema,
  translateSchema,
  translationsByKeySchema,
} from "./schema";

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

  getProjectLocales: protectedProcedure
    .input(projectLocalesSchema)
    .use(isOrganizationMember)
    .query(async ({ input }) => {
      const locales = await getProjectLocales(input);
      return locales.map(({ targetLanguage }) => targetLanguage);
    }),

  getTranslationsByKey: protectedProcedure
    .input(translationsByKeySchema)
    // .use(hasProjectAccess)
    .query(async ({ input }) => {
      const translations = await getTranslationsByKey(input);

      return translations.map((translation) => ({
        ...translation,
        createdAt: translation.createdAt.toISOString(),
        updatedAt: translation.updatedAt.toISOString(),
      }));
    }),

  deleteKeys: protectedProcedure
    .input(deleteKeysSchema)
    .use(hasProjectAccess)
    .mutation(async ({ input }) => {
      const data = await deleteKeys(input);

      return data;
    }),
});
