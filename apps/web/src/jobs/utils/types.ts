import type { projectSettings } from "@/db/schema";

export type PromptOptions = {
  sourceLocale: string;
  targetLocale: string;
  sourceFormat?: string;
  settings?: Partial<typeof projectSettings.$inferSelect>;
};
