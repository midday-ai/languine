CREATE TABLE `translations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`source_language` text NOT NULL,
	`target_language` text NOT NULL,
	`source_text` text NOT NULL,
	`translated_text` text NOT NULL,
	`branch` text,
	`commit` text,
	`commit_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_id`);--> statement-breakpoint
CREATE INDEX `translations_created_at_idx` ON `translations` (`created_at`);