import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    apiKey: text("api_key")
      .notNull()
      .unique()
      .$defaultFn(() => `user_${createId()}`),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("api_key_idx").on(table.apiKey),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").notNull(),
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

export const accounts = pgTable(
  "accounts",
  {
    id: text("id")
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
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("provider_compound_idx").on(table.providerId, table.accountId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("identifier_idx").on(table.identifier),
    index("verifications_expires_at_idx").on(table.expiresAt),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: text("id")
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
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    metadata: text("metadata"),
  },
  (table) => [
    index("slug_idx").on(table.slug),
    index("org_api_key_idx").on(table.apiKey),
  ],
);

export const members = pgTable(
  "members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("org_user_idx").on(table.organizationId, table.userId)],
);

export const invitations = pgTable(
  "invitations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("org_email_idx").on(table.organizationId, table.email),
    index("invitations_expires_at_idx").on(table.expiresAt),
  ],
);

export const projectSettings = pgTable(
  "project_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Tuning start
    translationMemory: boolean("translation_memory").notNull().default(true),
    qualityChecks: boolean("quality_checks").notNull().default(true),
    contextDetection: boolean("context_detection").notNull().default(true),
    lengthControl: text("length_control", {
      enum: ["flexible", "strict", "exact", "loose"],
    })
      .notNull()
      .default("flexible"),
    inclusiveLanguage: boolean("inclusive_language").notNull().default(true),
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
    idioms: boolean("idioms").notNull().default(true),
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

    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("project_idx").on(table.projectId),
    index("created_at_idx").on(table.createdAt),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("org_idx").on(table.organizationId),
    uniqueIndex("slug_org_idx").on(table.slug, table.organizationId),
    index("project_slug_idx").on(table.slug),
    index("project_org_id_idx").on(table.organizationId),
  ],
);

export const translations = pgTable(
  "translations",
  {
    id: text("id")
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
    sourceFile: text("source_file").notNull(),
    sourceType: text("source_type").default("key").notNull(),
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
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
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

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(members),
  sentInvitations: many(invitations, { relationName: "inviter" }),
  translations: many(translations),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  invitations: many(invitations),
  translations: many(translations),
  projectSettings: many(projectSettings),
}));

export const membersRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
    relationName: "inviter",
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  translations: many(translations),
  settings: many(projectSettings),
}));

export const projectSettingsRelations = relations(
  projectSettings,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectSettings.projectId],
      references: [projects.id],
    }),
    organization: one(organizations, {
      fields: [projectSettings.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const translationsRelations = relations(translations, ({ one }) => ({
  project: one(projects, {
    fields: [translations.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [translations.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [translations.userId],
    references: [users.id],
  }),
}));
