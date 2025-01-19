import type { projectSettings } from "@/db/schema";

export type PromptOptions = {
  sourceLocale: string;
  targetLocale: string;
  settings?: Partial<typeof projectSettings.$inferSelect>;
};
