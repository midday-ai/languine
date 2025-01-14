ALTER TABLE `project_settings` ADD `provider` text DEFAULT 'openai' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `model` text DEFAULT 'gpt-4-turbo' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `provider_api_key` text;