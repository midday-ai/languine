import { z } from "zod";

export const projectSettingsSchema = z.object({
  translationMemory: z.boolean().optional(),
  qualityChecks: z.boolean().optional(),
  contextDetection: z.boolean().optional(),
  lengthControl: z.enum(["flexible", "strict", "exact", "loose"]).optional(),
  inclusiveLanguage: z.boolean().optional(),
  formality: z.enum(["casual", "formal", "neutral"]).optional(),
  toneOfVoice: z
    .enum([
      "casual",
      "formal",
      "friendly",
      "professional",
      "playful",
      "serious",
      "confident",
      "humble",
      "direct",
      "diplomatic",
    ])
    .optional(),
  brandName: z.string().optional(),
  brandVoice: z.string().optional(),
  emotiveIntent: z
    .enum([
      "neutral",
      "positive",
      "empathetic",
      "professional",
      "friendly",
      "enthusiastic",
    ])
    .optional(),
  idioms: z.boolean().optional(),
  terminology: z.string().optional(),
  domainExpertise: z
    .enum([
      "general",
      "technical",
      "medical",
      "legal",
      "financial",
      "marketing",
      "academic",
    ])
    .optional(),
});

export type ProjectSettings = z.infer<typeof projectSettingsSchema>;

export const analyticsSchema = z.object({
  projectSlug: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  organizationId: z.string(),
  period: z.enum(["monthly", "weekly", "daily"]).optional().default("daily"),
});

export type AnalyticsSchema = z.infer<typeof analyticsSchema>;

export const jobsSchema = z.object({
  apiKey: z.string(),
  projectId: z.string(),
  sourceFormat: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  branch: z.string().optional().nullable(),
  commit: z.string().optional().nullable(),
  commitLink: z.string().optional().nullable(),
  sourceProvider: z.string().nullable().optional(),
  commitMessage: z.string().optional().nullable(),
  content: z.array(
    z.object({
      key: z.string(),
      sourceText: z.string(),
      documentName: z.string().nullable().optional(),
    }),
  ),
});

export type JobsSchema = z.infer<typeof jobsSchema>;

export const organizationSchema = z.object({ organizationId: z.string() });
export type OrganizationSchema = z.infer<typeof organizationSchema>;

export const createOrganizationSchema = z.object({
  name: z.string().min(1),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  logo: z.string().optional(),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;

export const deleteOrganizationInviteSchema = z.object({
  organizationId: z.string(),
  inviteId: z.string(),
});

export type DeleteOrganizationInviteSchema = z.infer<
  typeof deleteOrganizationInviteSchema
>;

export const deleteOrganizationMemberSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
});

export type DeleteOrganizationMemberSchema = z.infer<
  typeof deleteOrganizationMemberSchema
>;

export const updateOrganizationTierSchema = z.object({
  organizationId: z.string(),
  tier: z.number().min(0).max(5),
});

export type UpdateOrganizationTierSchema = z.infer<
  typeof updateOrganizationTierSchema
>;

export const translateSchema = z.object({
  organizationId: z.string(),
  cursor: z.string().nullish(),
  slug: z.string(),
  limit: z.number().optional(),
  search: z.string().nullish().optional(),
});

export type TranslateSchema = z.infer<typeof translateSchema>;

export const deleteKeysSchema = z.object({
  projectId: z.string(),
  keys: z.array(z.string()),
});

export type DeleteKeysSchema = z.infer<typeof deleteKeysSchema>;
