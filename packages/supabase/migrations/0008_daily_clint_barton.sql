ALTER TABLE `translations` RENAME COLUMN "project_id" TO "project_slug";--> statement-breakpoint
DROP INDEX `project_translations_idx`;--> statement-breakpoint
DROP INDEX `unique_translation_idx`;--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_translation_idx` ON `translations` (`project_slug`,`translation_key`,`target_language`);--> statement-breakpoint
ALTER TABLE `translations` ALTER COLUMN "project_slug" TO "project_slug" text NOT NULL REFERENCES projects(slug) ON DELETE cascade ON UPDATE no action;