DROP TABLE `documents`;--> statement-breakpoint
ALTER TABLE `translations` ADD `type` text DEFAULT 'key' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `provider`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `model`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `provider_api_key`;