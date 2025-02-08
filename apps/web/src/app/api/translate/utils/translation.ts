import { createTranslations } from "@/db/queries/translate";
import { translateKeys } from "@/jobs/utils/translate";

export const performTranslation = async (
  key: string,
  sourceText: string,
  params: {
    sourceLocale: string;
    targetLocale: string;
    format: string;
  },
): Promise<string> => {
  const translatedContent = await translateKeys(
    [{ key, sourceText }],
    {
      sourceLocale: params.sourceLocale,
      targetLocale: params.targetLocale,
      sourceFormat: params.format,
    },
    1,
  );

  return translatedContent[key] || "";
};

export const persistTranslation = async (
  params: {
    projectId: string;
    organizationId: string;
    format: string;
    key: string;
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    translatedText: string;
  },
  isDocument: boolean,
): Promise<void> => {
  await createTranslations({
    projectId: params.projectId,
    organizationId: params.organizationId,
    sourceFormat: params.format,
    translations: [
      {
        translationKey: params.key,
        sourceLanguage: params.sourceLocale,
        targetLanguage: params.targetLocale,
        sourceText: params.sourceText,
        translatedText: params.translatedText,
        sourceFile: "api",
        sourceType: isDocument ? "document" : "key",
      },
    ],
  });
};
