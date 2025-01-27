import { UTCDate } from "@date-fns/utc";
import { createClient } from "@languine/supabase/server";
import type { Database } from "@languine/supabase/types";

export const createTranslations = async ({
  projectId,
  organizationId,
  userId,
  sourceFormat,
  translations: translationItems,
  branch,
  commit,
  sourceProvider,
  commitMessage,
  commitLink,
}: {
  projectId: string;
  userId?: string | null;
  organizationId: string;
  sourceFormat: string;
  branch?: string | null;
  commit?: string | null;
  sourceProvider?: string | null;
  commitMessage?: string | null;
  commitLink?: string | null;
  translations: {
    translationKey: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceText: string;
    translatedText: string;
    sourceFile: string;
  }[];
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("translations").upsert(
    translationItems.map((translation) => ({
      project_id: projectId,
      source_format: sourceFormat,
      user_id: userId,
      organization_id: organizationId,
      branch,
      commit,
      source_provider: sourceProvider,
      commit_message: commitMessage,
      commit_link: commitLink,
      translation_key: translation.translationKey,
      source_language: translation.sourceLanguage,
      target_language: translation.targetLanguage,
      source_text: translation.sourceText,
      translated_text: translation.translatedText,
      source_file: translation.sourceFile,
      updated_at: new UTCDate().toISOString(),
    })),
    {
      onConflict: "project_id,translation_key,target_language",
    },
  );

  if (error) throw error;
  return data;
};

export const createDocument = async ({
  projectId,
  organizationId,
  userId,
  sourceFile,
  sourceLanguage,
  sourceText,
  targetLanguage,
  translatedText,
  sourceFormat,
  branch,
  commit,
  commitLink,
  sourceProvider,
  commitMessage,
}: {
  projectId: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  userId?: string | null;
  organizationId: string;
  sourceFormat: string;
  sourceFile: string;
  branch?: string | null;
  commit?: string | null;
  sourceProvider?: string | null;
  commitMessage?: string | null;
  commitLink?: string | null;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("translations").upsert(
    {
      project_id: projectId,
      organization_id: organizationId,
      user_id: userId,
      source_file: sourceFile,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      translation_key: sourceFile,
      source_type: "document",
      source_format: sourceFormat,
      source_text: sourceText,
      translated_text: translatedText,
      branch,
      commit,
      commit_link: commitLink,
      source_provider: sourceProvider,
      commit_message: commitMessage,
      updated_at: new UTCDate().toISOString(),
    },
    {
      onConflict: "project_id,translation_key,target_language",
    },
  );

  if (error) throw error;
  return data;
};

export const getTranslationsBySlug = async ({
  limit = 10,
  slug,
  cursor,
  search,
  organizationId,
}: {
  slug: string;
  search?: string | null;
  cursor?: string | null;
  organizationId: string;
  limit?: number;
}): Promise<Database["public"]["Tables"]["translations"]["Row"][]> => {
  const supabase = await createClient();

  let query = supabase
    .from("translations")
    .select("*, projects!inner(*)")
    .eq("projects.slug", slug)
    .eq("projects.organization_id", organizationId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  if (cursor) {
    query = query.gt("id", cursor);
  }

  if (search) {
    query = query.or(
      `translation_key.ilike.%${search.toLowerCase()}%,source_text.ilike.%${search.toLowerCase()}%`,
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
};

export const deleteKeys = async ({
  projectId,
  keys,
}: { projectId: string; keys: string[] }) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("translations")
    .delete()
    .eq("project_id", projectId)
    .in("translation_key", keys)
    .select();

  if (error) throw error;
  return data;
};
