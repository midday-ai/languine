import type { translateTask } from "@/jobs/translate/translate";
import { tasks } from "@trigger.dev/sdk/v3";
import { createTRPCRouter, protectedProcedure } from "../init";
import { hasProjectAccess } from "../permissions/project";
import {
  checkTranslationLimits,
  getProjectOrganization,
  getTranslationTaskOptions,
} from "./jobs.utils";
import { jobsSchema } from "./schema";

export const jobsRouter = createTRPCRouter({
  startJob: protectedProcedure
    .input(jobsSchema)
    .use(hasProjectAccess)
    .mutation(async ({ input }) => {
      const org = await getProjectOrganization(input.projectId);

      const limitCheckResult = await checkTranslationLimits(org, input);

      if (limitCheckResult?.error) {
        return limitCheckResult;
      }

      const { options, isFreeUser } = getTranslationTaskOptions(org);

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
