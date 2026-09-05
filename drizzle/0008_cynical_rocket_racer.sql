CREATE TABLE `todo_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`todo_id` text NOT NULL,
	`occurrence_date` text NOT NULL,
	`completed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`todo_id`) REFERENCES `todos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `todo_occurrences_todo_id_idx` ON `todo_occurrences` (`todo_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `todo_occurrences_todo_id_date_idx` ON `todo_occurrences` (`todo_id`,`occurrence_date`);--> statement-breakpoint
ALTER TABLE `todos` ADD `recurrence` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `todos` ADD `reminder` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
