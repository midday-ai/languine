import { z } from "zod";

export const CONFIG_SCHEMA = z.object({
  GITHUB_REPOSITORY: z.string(),
  GITHUB_REPOSITORY_OWNER: z.string(),
  GITHUB_REF_NAME: z.string(),
  GITHUB_HEAD_REF: z.string(),
  GITHUB_TOKEN: z.string(),
  LANGUINE_API_KEY: z.string(),
  LANGUINE_VERSION: z.string().optional().default("latest"),
  LANGUINE_PROJECT_ID: z.string(),
});

export type Config = z.infer<typeof CONFIG_SCHEMA>;
