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
  commitMessage: z
    .string()
    .default("chore: (i18n) update translations using Languine.ai"),
  prTitle: z
    .string()
    .optional()
    .default("chore: (i18n) update translations using Languine.ai"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(): Config {
  return ConfigSchema.parse({
    apiKey: process.env.LANGUINE_API_KEY,
    projectId: process.env.LANGUINE_PROJECT_ID,
    cliVersion: process.env.LANGUINE_CLI_VERSION,
    workingDirectory: process.env.LANGUINE_WORKING_DIRECTORY,
    createPullRequest: process.env.LANGUINE_CREATE_PULL_REQUEST === "true",
    commitMessage:
      process.env.LANGUINE_COMMIT_MESSAGE || process.env.COMMIT_MESSAGE,
    prTitle: process.env.LANGUINE_PR_TITLE,
  });
}
