CREATE TABLE `email_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generated_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`activity_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`enabled` integer DEFAULT 0 NOT NULL,
	`cadence_days` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`filename` text NOT NULL,
	`reference_kind` text NOT NULL,
	`semantic` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_vectors` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`chunk_id` text NOT NULL,
	`page` integer NOT NULL,
	`content` text NOT NULL,
	`vector` text
);
