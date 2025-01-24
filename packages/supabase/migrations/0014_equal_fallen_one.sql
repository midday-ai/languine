ALTER TABLE `translations` RENAME COLUMN "project_slug" TO "project_id";--> statement-breakpoint
DROP INDEX `project_translations_idx`;--> statement-breakpoint
DROP INDEX `unique_translation_idx`;--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_translation_idx` ON `translations` (`project_id`,`translation_key`,`target_language`);--> statement-breakpoint
ALTER TABLE `translations` ALTER COLUMN "project_id" TO "project_id" text NOT NULL REFERENCES projects(id) ON DELETE cascade ON UPDATE no action;