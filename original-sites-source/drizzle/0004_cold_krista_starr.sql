CREATE INDEX `delivery_user_date_idx` ON `email_deliveries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `asset_owner_activity_idx` ON `generated_assets` (`owner_id`,`activity_id`);--> statement-breakpoint
CREATE INDEX `source_owner_idx` ON `source_documents` (`owner_id`);--> statement-breakpoint
CREATE INDEX `vector_source_idx` ON `source_vectors` (`source_id`);