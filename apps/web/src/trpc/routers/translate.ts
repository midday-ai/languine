import { createTranslation } from "@/db/queries/translate";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";
import { isProjectMember } from "../permissions/project";

export const translateRouter = createTRPCRouter({
  pushTranslations: protectedProcedure
    .use(rateLimitMiddleware)
    .use(isProjectMember)
    .input(
      z.object({
        projectId: z.string(),
        translations: z.array(
          z.object({
            sourceLanguage: z.string(),
            targetLanguage: z.string(),
            sourceText: z.string(),
            translatedText: z.string(),
            context: z.string().optional(),
            branch: z.string().optional(),
            commit: z.string().optional(),
            commitMessage: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return createTranslation(input);
    }),
});
