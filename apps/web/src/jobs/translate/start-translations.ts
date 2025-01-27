import { validateJobPermissions } from "@/db/queries/permissions";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { calculateChunkSize } from "../utils/chunk";
import { translateLocaleTask } from "./translate-locale";

// trigger
type TranslationOutput = {
  translations: Array<{ key: string; translatedText: string }>;
  targetLocale: string;
  status: string;
  progress: number;
};

const startTranslationsSchema = z.object({
  projectId: z.string(),
  apiKey: z.string(),
  sourceFormat: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  branch: z.string().nullable().optional(),
  commit: z.string().nullable().optional(),
  sourceProvider: z.string().nullable().optional(),
  commitMessage: z.string().nullable().optional(),
  commitLink: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  content: z.array(
    z.object({
      key: z.string(),
      sourceText: z.string(),
      sourceFile: z.string(),
    }),
  ),
});

export const startTranslationsTask = schemaTask({
  id: "start-translations",
  schema: startTranslationsSchema,
  maxDuration: 600, // 10 minutes
  run: async (payload) => {
    const { project } = await validateJobPermissions({
      projectId: payload.projectId,
      apiKey: payload.apiKey,
    });

    if (!project) {
      throw new Error("No project found");
    }

    const chunkSize = calculateChunkSize(payload.content);

    // Create a batch of translation jobs for each target language
    const jobs = await translateLocaleTask.batchTriggerAndWait(
      payload.targetLanguages.map((targetLocale) => ({
        payload: {
          organizationId: project.organizationId,
          projectId: project.id,
          apiKey: payload.apiKey,
          sourceFormat: payload.sourceFormat,
          sourceLanguage: payload.sourceLanguage,
          targetLocale,
          branch: payload.branch,
          commit: payload.commit,
          sourceProvider: payload.sourceProvider,
          commitMessage: payload.commitMessage,
          commitLink: payload.commitLink,
          userId: payload.userId,
          content: payload.content,
          chunkSize,
        },
      })),
    );

    console.log("jobs", jobs);

    // Aggregate translations from all jobs
    const translations: Record<
      string,
      Array<{ key: string; translatedText: string }>
    > = {};

    // Treat jobs as an array since BatchResult contains an array of results
    const jobResults = jobs as unknown as Array<{
      output: TranslationOutput | undefined;
      status: string;
    }>;

    console.log("jobResults", jobResults);

    for (const job of jobResults) {
      if (job.output) {
        translations[job.output.targetLocale] = job.output.translations;
      }
    }

    return {
      translations,
      jobs: jobResults.map((job) => ({
        locale: job.output?.targetLocale,
      })),
    };
  },
});
