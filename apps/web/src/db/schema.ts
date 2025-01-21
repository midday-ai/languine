import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    apiKey: text("api_key")
      .notNull()
      .unique()
      .$defaultFn(() => `user_${createId()}`),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("api_key_idx").on(table.apiKey),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("token_idx").on(table.token),
    index("expires_at_idx").on(table.expiresAt),
  ],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("provider_compound_idx").on(table.providerId, table.accountId),
  ],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("identifier_idx").on(table.identifier),
    index("verifications_expires_at_idx").on(table.expiresAt),
  ],
);

export const organizations = sqliteTable(
  "organizations",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    plan: text("plan", { enum: ["free", "pro"] })
      .notNull()
      .default("free"),
    apiKey: text("api_key")
      .notNull()
      .unique()
      .$defaultFn(() => `org_${createId()}`),
    tier: integer("tier").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    metadata: text("metadata"),
  },
  (table) => [
    index("slug_idx").on(table.slug),
    index("org_api_key_idx").on(table.apiKey),
  ],
);

export const members = sqliteTable(
  "members",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("org_user_idx").on(table.organizationId, table.userId)],
);

export const invitations = sqliteTable(
  "invitations",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("org_email_idx").on(table.organizationId, table.email),
    index("invitations_expires_at_idx").on(table.expiresAt),
  ],
);

export const projectSettings = sqliteTable(
  "project_settings",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Tuning start
    translationMemory: integer("translation_memory", { mode: "boolean" })
      .notNull()
      .default(true),
    qualityChecks: integer("quality_checks", { mode: "boolean" })
      .notNull()
      .default(true),
    contextDetection: integer("context_detection", { mode: "boolean" })
      .notNull()
      .default(true),
    lengthControl: text("length_control", {
      enum: ["flexible", "strict", "exact", "loose"],
    })
      .notNull()
      .default("flexible"),
    inclusiveLanguage: integer("inclusive_language", { mode: "boolean" })
      .notNull()
      .default(true),
    formality: text("formality", { enum: ["casual", "formal", "neutral"] })
      .notNull()
      .default("casual"),
    toneOfVoice: text("tone_of_voice", {
      enum: [
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
      ],
    })
      .notNull()
      .default("casual"),
    brandName: text("brand_name"),
    brandVoice: text("brand_voice"),
    emotiveIntent: text("emotive_intent", {
      enum: [
        "neutral",
        "positive",
        "empathetic",
        "professional",
        "friendly",
        "enthusiastic",
      ],
    })
      .notNull()
      .default("neutral"),
    idioms: integer("idioms", { mode: "boolean" }).notNull().default(true),
    terminology: text("terminology"),
    domainExpertise: text("domain_expertise", {
      enum: [
        "general",
        "technical",
        "medical",
        "legal",
        "financial",
        "marketing",
        "academic",
      ],
    })
      .notNull()
      .default("general"),
    // Tuning end

    provider: text("provider").notNull().default("openai"),
    model: text("model").notNull().default("gpt-4-turbo"),
    providerApiKey: text("provider_api_key"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_idx").on(table.projectId),
    index("created_at_idx").on(table.createdAt),
  ],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("org_idx").on(table.organizationId),
    uniqueIndex("slug_org_idx").on(table.slug, table.organizationId),
    index("project_slug_idx").on(table.slug),
    index("project_org_id_idx").on(table.organizationId),
  ],
);

export const translations = sqliteTable(
  "translations",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    sourceFormat: text("source_format").notNull(),
    sourceLanguage: text("source_language").notNull(),
    targetLanguage: text("target_language").notNull(),
    translationKey: text("translation_key").notNull(),
    sourceText: text("source_text").notNull(),
    translatedText: text("translated_text").notNull(),
    context: text("context"),
    branch: text("branch"),
    commit: text("commit"),
    commitLink: text("commit_link"),
    sourceProvider: text("source_provider"),
    commitMessage: text("commit_message"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_translations_idx").on(table.projectId),
    index("translations_created_at_idx").on(table.createdAt),
    uniqueIndex("unique_translation_idx").on(
      table.projectId,
      table.translationKey,
      table.targetLanguage,
    ),
    index("org_translations_idx").on(table.organizationId),
    index("source_language_idx").on(table.sourceLanguage),
    index("target_language_idx").on(table.targetLanguage),
    index("translations_project_id_idx").on(table.projectId),
  ],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    sourceFormat: text("source_format").notNull(),
    sourceLanguage: text("source_language").notNull(),
    targetLanguage: text("target_language").notNull(),
    sourceText: text("source_text").notNull(),
    translatedText: text("translated_text").notNull(),
    name: text("document_name").notNull(),
    branch: text("branch"),
    commit: text("commit"),
    commitLink: text("commit_link"),
    sourceProvider: text("source_provider"),
    commitMessage: text("commit_message"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_documents_idx").on(table.projectId),
    index("documents_created_at_idx").on(table.createdAt),
    uniqueIndex("unique_document_idx").on(
      table.projectId,
      table.targetLanguage,
      table.name,
    ),
    index("org_documents_idx").on(table.organizationId),
    index("documents_source_language_idx").on(table.sourceLanguage),
    index("documents_target_language_idx").on(table.targetLanguage),
    index("documents_project_id_idx").on(table.projectId),
  ],
);
