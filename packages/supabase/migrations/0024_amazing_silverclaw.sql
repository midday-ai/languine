DROP INDEX "accounts_user_id_idx";--> statement-breakpoint
DROP INDEX "provider_compound_idx";--> statement-breakpoint
DROP INDEX "org_email_idx";--> statement-breakpoint
DROP INDEX "invitations_expires_at_idx";--> statement-breakpoint
DROP INDEX "org_user_idx";--> statement-breakpoint
DROP INDEX "organizations_slug_unique";--> statement-breakpoint
DROP INDEX "organizations_api_key_unique";--> statement-breakpoint
DROP INDEX "slug_idx";--> statement-breakpoint
DROP INDEX "org_api_key_idx";--> statement-breakpoint
DROP INDEX "project_idx";--> statement-breakpoint
DROP INDEX "created_at_idx";--> statement-breakpoint
DROP INDEX "org_idx";--> statement-breakpoint
DROP INDEX "slug_org_idx";--> statement-breakpoint
DROP INDEX "project_slug_idx";--> statement-breakpoint
DROP INDEX "project_org_id_idx";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "user_id_idx";--> statement-breakpoint
DROP INDEX "token_idx";--> statement-breakpoint
DROP INDEX "expires_at_idx";--> statement-breakpoint
DROP INDEX "project_translations_idx";--> statement-breakpoint
DROP INDEX "translations_created_at_idx";--> statement-breakpoint
DROP INDEX "unique_translation_idx";--> statement-breakpoint
DROP INDEX "org_translations_idx";--> statement-breakpoint
DROP INDEX "source_language_idx";--> statement-breakpoint
DROP INDEX "target_language_idx";--> statement-breakpoint
DROP INDEX "translations_project_id_idx";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_api_key_unique";--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
DROP INDEX "api_key_idx";--> statement-breakpoint
DROP INDEX "identifier_idx";--> statement-breakpoint
DROP INDEX "verifications_expires_at_idx";--> statement-breakpoint
ALTER TABLE `organizations` ALTER COLUMN "tier" TO "tier" integer NOT NULL;--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `provider_compound_idx` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `org_email_idx` ON `invitations` (`organization_id`,`email`);--> statement-breakpoint
CREATE INDEX `invitations_expires_at_idx` ON `invitations` (`expires_at`);--> statement-breakpoint
CREATE INDEX `org_user_idx` ON `members` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_api_key_unique` ON `organizations` (`api_key`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `org_api_key_idx` ON `organizations` (`api_key`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `project_settings` (`project_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `project_settings` (`created_at`);--> statement-breakpoint
CREATE INDEX `org_idx` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `slug_org_idx` ON `projects` (`slug`,`organization_id`);--> statement-breakpoint
CREATE INDEX `project_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `project_org_id_idx` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_id`);--> statement-breakpoint
CREATE INDEX `translations_created_at_idx` ON `translations` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_translation_idx` ON `translations` (`project_id`,`translation_key`,`target_language`);--> statement-breakpoint
CREATE INDEX `org_translations_idx` ON `translations` (`organization_id`);--> statement-breakpoint
CREATE INDEX `source_language_idx` ON `translations` (`source_language`);--> statement-breakpoint
CREATE INDEX `target_language_idx` ON `translations` (`target_language`);--> statement-breakpoint
CREATE INDEX `translations_project_id_idx` ON `translations` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_api_key_unique` ON `users` (`api_key`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `api_key_idx` ON `users` (`api_key`);--> statement-breakpoint
CREATE INDEX `identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `verifications_expires_at_idx` ON `verifications` (`expires_at`);--> statement-breakpoint
ALTER TABLE `organizations` ALTER COLUMN "tier" TO "tier" integer NOT NULL DEFAULT 0;