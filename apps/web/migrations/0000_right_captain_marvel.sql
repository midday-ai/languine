CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"api_key" text NOT NULL,
	"tier" text DEFAULT '0' NOT NULL,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "project_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"translation_memory" boolean DEFAULT true NOT NULL,
	"quality_checks" boolean DEFAULT true NOT NULL,
	"context_detection" boolean DEFAULT true NOT NULL,
	"length_control" text DEFAULT 'flexible' NOT NULL,
	"inclusive_language" boolean DEFAULT true NOT NULL,
	"formality" text DEFAULT 'casual' NOT NULL,
	"tone_of_voice" text DEFAULT 'casual' NOT NULL,
	"brand_name" text,
	"brand_voice" text,
	"emotive_intent" text DEFAULT 'neutral' NOT NULL,
	"idioms" boolean DEFAULT true NOT NULL,
	"terminology" text,
	"domain_expertise" text DEFAULT 'general' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"organization_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"source_format" text NOT NULL,
	"source_file" text NOT NULL,
	"source_type" text DEFAULT 'key' NOT NULL,
	"source_language" text NOT NULL,
	"target_language" text NOT NULL,
	"translation_key" text NOT NULL,
	"source_text" text NOT NULL,
	"translated_text" text NOT NULL,
	"context" text,
	"branch" text,
	"commit" text,
	"commit_link" text,
	"source_provider" text,
	"commit_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"api_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "provider_compound_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "org_email_idx" ON "invitations" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "invitations_expires_at_idx" ON "invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "org_user_idx" ON "members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "org_api_key_idx" ON "organizations" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX "project_idx" ON "project_settings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "project_settings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "org_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_org_idx" ON "projects" USING btree ("slug","organization_id");--> statement-breakpoint
CREATE INDEX "project_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "project_org_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "project_translations_idx" ON "translations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "translations_created_at_idx" ON "translations" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_translation_idx" ON "translations" USING btree ("project_id","translation_key","target_language");--> statement-breakpoint
CREATE INDEX "org_translations_idx" ON "translations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "source_language_idx" ON "translations" USING btree ("source_language");--> statement-breakpoint
CREATE INDEX "target_language_idx" ON "translations" USING btree ("target_language");--> statement-breakpoint
CREATE INDEX "translations_project_id_idx" ON "translations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "api_key_idx" ON "users" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX "identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");