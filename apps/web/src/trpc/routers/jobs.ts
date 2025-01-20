import { db } from "@/db";
import { getOrganizationTotalKeys } from "@/db/queries/organization";
import { organizations, projects } from "@/db/schema";
import type { translateTask } from "@/jobs/translate/translate";
import { TIERS_MAX_KEYS } from "@/lib/tiers";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
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
      const project = await db
        .select()
        .from(organizations)
        .innerJoin(projects, eq(projects.organizationId, organizations.id))
        .where(eq(projects.id, input.projectId))
        .get();

      const org = project?.organizations;

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      const isFreeUser = org?.plan === "free";

      const totalKeys = await getOrganizationTotalKeys(org?.id);

      // Calculate the total number of keys, saved keys + new keys (for each target language)
      const nextTotalKeys =
        (totalKeys?.total ?? 0) +
        input.content.length * input.targetLanguages.length;

      const currentKeysLimit =
        TIERS_MAX_KEYS[org.tier as keyof typeof TIERS_MAX_KEYS];

      if (nextTotalKeys >= currentKeysLimit) {
        return {
          meta: {
            plan: org.plan,
            tier: org.tier,
            organizationId: org.id,
          },
          error: {
            code: "LIMIT_REACHED",
            message: "You have reached the maximum number of keys",
          },
        };
      }

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
