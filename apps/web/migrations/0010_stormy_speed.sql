ALTER TABLE `translations` RENAME COLUMN "project_slug" TO "project_id";--> statement-breakpoint
DROP INDEX `project_translations_idx`;--> statement-breakpoint
DROP INDEX `unique_translation_idx`;--> statement-breakpoint
CREATE INDEX `project_translations_idx` ON `translations` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_translation_idx` ON `translations` (`project_id`,`translation_key`,`target_language`);--> statement-breakpoint
ALTER TABLE `translations` ALTER COLUMN "project_id" TO "project_id" text NOT NULL REFERENCES projects(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`organization_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "name", "slug", "description", "organization_id", "created_at", "updated_at") SELECT "id", "name", "slug", "description", "organization_id", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `org_idx` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `slug_org_idx` ON `projects` (`slug`,`organization_id`);