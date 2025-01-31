import { z } from "zod";

export const ConfigSchema = z.object({
  apiKey: z.string({
    required_error: "LANGUINE_API_KEY is required",
    invalid_type_error: "LANGUINE_API_KEY must be a string",
  }),
  projectId: z.string({
    required_error: "LANGUINE_PROJECT_ID is required",
    invalid_type_error: "LANGUINE_PROJECT_ID must be a string",
  }),
  cliVersion: z.string().default("latest"),
  workingDirectory: z.string().default("."),
  createPullRequest: z.boolean().default(false),
  baseBranch: z.string().default("main"),
  commitMessage: z
    .string()
    .default("chore: (i18n) update translations via Languine"),
  prTitle: z.string().optional(),
  prBody: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(): Config {
  return ConfigSchema.parse({
    apiKey: process.env.LANGUINE_API_KEY,
    projectId: process.env.LANGUINE_PROJECT_ID,
    cliVersion: process.env.LANGUINE_CLI_VERSION,
    workingDirectory: process.env.INPUT_WORKING_DIRECTORY,
    createPullRequest: process.env.INPUT_CREATE_PULL_REQUEST === "true",
    baseBranch: process.env.INPUT_BASE_BRANCH || process.env.BASE_BRANCH,
    commitMessage:
      process.env.INPUT_COMMIT_MESSAGE || process.env.COMMIT_MESSAGE,
    prTitle: process.env.INPUT_PR_TITLE,
    prBody: process.env.INPUT_PR_BODY,
  });
}
