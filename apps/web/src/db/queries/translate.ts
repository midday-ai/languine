import { db } from "@/db";
import { translations } from "@/db/schema";

export const createTranslation = async ({
  projectId,
  translations: translationItems,
}: {
  projectId: string;
  translations: {
    sourceLanguage: string;
    targetLanguage: string;
    sourceText: string;
    translatedText: string;
    context?: string;
    branch?: string;
    commit?: string;
    commitMessage?: string;
  }[];
}) => {
  return db
    .insert(translations)
    .values(
      translationItems.map((translation) => ({
        projectId,
        ...translation,
      })),
    )
    .returning();
};
