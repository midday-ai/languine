import { getProjectById } from "@/db/queries/project";
import {
  createTranslation,
  getTranslationsBySlug,
} from "@/db/queries/translate";
import { getTranslator } from "@/lib/translators";
import { TRPCError } from "@trpc/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";
import { isOrganizationMember } from "../permissions/organization";

export const translateRouter = createTRPCRouter({
  pushTranslations: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        sourceFormat: z.enum(["json", "js", "md"]),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
        branch: z.string().optional(),
        commit: z.string().optional(),
        commitMessage: z.string().optional(),
        content: z.array(
          z.object({
            key: z.string(),
            sourceText: z.string(),
            context: z.string().optional(),
          }),
        ),
      }),
    )
    .use(rateLimitMiddleware)
    .use(isOrganizationMember)
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById({ id: input.projectId });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const translator = await getTranslator(input.sourceFormat);

      if (!translator) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No translator found for format: ${input.sourceFormat}`,
        });
      }

      const translations = await translator(
        input.content.map((t) => t.sourceText),
        {
          format: input.sourceFormat,
          contentLocale: input.sourceLanguage,
          targetLocale: input.targetLanguage,
        },
      );

      waitUntil(
        createTranslation({
          projectId: input.projectId,
          organizationId: project.organizationId,
          userId: ctx.type === "user" ? ctx.authenticatedId : undefined,
          sourceFormat: input.sourceFormat,
          translations: input.content.map((t, index) => ({
            ...t,
            translationKey: t.key,
            translatedText: translations[index],
            sourceLanguage: input.sourceLanguage,
            targetLanguage: input.targetLanguage,
            branch: input.branch,
            commit: input.commit,
            commitMessage: input.commitMessage,
          })),
        }),
      );

      return translations;
    }),

  getTranslationsBySlug: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        cursor: z.string().nullish(),
        slug: z.string(),
        limit: z.number().optional(),
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
