ALTER TABLE `projects` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `slug_org_idx` ON `projects` (`slug`,`organization_id`);