CREATE TABLE `members` (
	`email` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`role` text DEFAULT 'learner' NOT NULL,
	`department` text DEFAULT 'Unassigned' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_user_id_unique` ON `members` (`user_id`);--> statement-breakpoint
CREATE TABLE `organization_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
