ALTER TABLE `translations` ADD `organization_id` text NOT NULL REFERENCES organizations(id);--> statement-breakpoint
CREATE INDEX `org_translations_idx` ON `translations` (`organization_id`);--> statement-breakpoint
CREATE INDEX `source_language_idx` ON `translations` (`source_language`);--> statement-breakpoint
CREATE INDEX `target_language_idx` ON `translations` (`target_language`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `project_settings` (`created_at`);--> statement-breakpoint
CREATE INDEX `api_key_idx` ON `users` (`api_key`);