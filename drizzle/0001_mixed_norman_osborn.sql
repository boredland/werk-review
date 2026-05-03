CREATE TABLE `author_photos` (
	`author_id` text PRIMARY KEY NOT NULL,
	`r2_key` text NOT NULL,
	`description` text,
	`source_label` text,
	`source_url` text,
	`uploaded_by` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
