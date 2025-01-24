ALTER TABLE `project_settings` ADD `translation_memory` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `quality_checks` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `context_detection` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `length_control` text DEFAULT 'flexible' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `inclusive_language` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `formality` text DEFAULT 'casual' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `tone_of_voice` text DEFAULT 'casual' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `brand_name` text;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `brand_voice` text;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `emotive_intent` text DEFAULT 'neutral' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `idioms` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `terminology` text;--> statement-breakpoint
ALTER TABLE `project_settings` ADD `domain_expertise` text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `cache`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `context`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `temperature`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `instructions`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `memory`;--> statement-breakpoint
ALTER TABLE `project_settings` DROP COLUMN `grammar`;