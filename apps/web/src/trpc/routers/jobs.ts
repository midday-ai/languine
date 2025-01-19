import type { translateTask } from "@/jobs/translate/translate";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";

export const jobsRouter = createTRPCRouter({
  startJob: protectedProcedure
    .input(
      z.object({
        apiKey: z.string(),
        projectId: z.string(),
        sourceFormat: z.string(),
        sourceLanguage: z.string(),
        targetLanguages: z.array(z.string()),
        content: z.array(
          z.object({
            key: z.string(),
            sourceText: z.string(),
          }),
        ),
      }),
    )
    .use(rateLimitMiddleware)
    .mutation(async ({ input }) => {
      const run = await tasks.trigger<typeof translateTask>("translate", {
        apiKey: input.apiKey,
        projectId: input.projectId,
        sourceFormat: input.sourceFormat,
        sourceLanguage: input.sourceLanguage,
        targetLanguages: input.targetLanguages,
        content: input.content,
      });

      return run;
    }),
});
