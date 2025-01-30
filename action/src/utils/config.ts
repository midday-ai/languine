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
  createPullRequest: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  baseBranch: z.string().default("main"),
  commitMessage: z.string().default("chore: (i18n) update translations"),
  prTitle: z.string().default("chore: (i18n) update translations"),
  prBody: z
    .string()
    .default("This PR contains updated translations from Languine."),
  workingDirectory: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(): Config {
  return ConfigSchema.parse({
    apiKey: process.env.LANGUINE_API_KEY,
    projectId: process.env.LANGUINE_PROJECT_ID,
    cliVersion: process.env.LANGUINE_CLI_VERSION,
    createPullRequest: process.env.CREATE_PULL_REQUEST,
    baseBranch: process.env.BASE_BRANCH,
    commitMessage: process.env.COMMIT_MESSAGE,
    prTitle: process.env.PR_TITLE,
    prBody: process.env.PR_BODY,
    workingDirectory: process.env.INPUT_WORKING_DIRECTORY,
  });
}
