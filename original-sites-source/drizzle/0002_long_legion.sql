CREATE TABLE `content_library` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`department` text NOT NULL,
	`language` text NOT NULL,
	`level` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
