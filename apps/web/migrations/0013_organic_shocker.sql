DROP INDEX `project_translations_idx`;--> statement-breakpoint
DROP INDEX `unique_translation_idx`;--> statement-breakpoint
ALTER TABLE `translations` ADD `project_slug` text NOT NULL REFERENCES projects(slug);--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_translation_idx` ON `translations` (`project_slug`,`translation_key`,`target_language`);--> statement-breakpoint
ALTER TABLE `translations` DROP COLUMN `project_id`;