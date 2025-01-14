ALTER TABLE `translations` ADD `user_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `translations` ADD `source_format` text NOT NULL;