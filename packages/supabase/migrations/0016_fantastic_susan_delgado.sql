CREATE INDEX `project_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `project_org_id_idx` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE INDEX `translations_project_id_idx` ON `translations` (`project_id`);