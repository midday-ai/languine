import { db } from "@/db";
import { organizations } from "@/db/schema";
import type { translateTask } from "@/jobs/translate/translate";
import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
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
        branch: z.string().optional().nullable(),
        commit: z.string().optional().nullable(),
        commitLink: z.string().optional().nullable(),
        sourceProvider: z.string().nullable().optional(),
        commitMessage: z.string().optional().nullable(),
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
      const org = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.projectId))
        .get();

      const isFreeUser = org?.plan === "free";

      const options = isFreeUser
        ? {
            queue: {
              name: "free-users",
              concurrencyLimit: 1,
            },
            // Free users get a concurrency key of "free-users" to share between each other
            concurrencyKey: "free-users",
          }
        : {
            queue: {
              name: "paid-users",
              concurrencyLimit: 5,
            },
            // Paid users get a concurrency key of their organization id with a concurrency limit of 5
            concurrencyKey: org?.id,
          };

      const run = await tasks.trigger<typeof translateTask>(
        "translate",
        {
          apiKey: input.apiKey,
          projectId: input.projectId,
          sourceFormat: input.sourceFormat,
          sourceLanguage: input.sourceLanguage,
          targetLanguages: input.targetLanguages,
          content: input.content,
          branch: input.branch,
          commit: input.commit,
          sourceProvider: input.sourceProvider,
          commitMessage: input.commitMessage,
          commitLink: input.commitLink,
        },
        options,
      );

      return {
        run,
        meta: {
          plan: isFreeUser ? "free" : "pro",
        },
      };
    }),
});
