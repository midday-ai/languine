CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text,
	`source_format` text NOT NULL,
	`source_language` text NOT NULL,
	`target_language` text NOT NULL,
	`source_text` text NOT NULL,
	`translated_text` text NOT NULL,
	`document_name` text NOT NULL,
	`branch` text,
	`commit` text,
	`commit_link` text,
	`source_provider` text,
	`commit_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_documents_idx` ON `documents` (`project_id`);--> statement-breakpoint
CREATE INDEX `documents_created_at_idx` ON `documents` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_document_idx` ON `documents` (`project_id`,`target_language`,`document_name`);--> statement-breakpoint
CREATE INDEX `org_documents_idx` ON `documents` (`organization_id`);--> statement-breakpoint
CREATE INDEX `documents_source_language_idx` ON `documents` (`source_language`);--> statement-breakpoint
CREATE INDEX `documents_target_language_idx` ON `documents` (`target_language`);--> statement-breakpoint
CREATE INDEX `documents_project_id_idx` ON `documents` (`project_id`);