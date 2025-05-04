PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_milestones`("id", "goal_id", "user_id", "title", "description", "date", "created_at", "updated_at") SELECT "id", "goal_id", "user_id", "title", "description", "date", "created_at", "updated_at" FROM `milestones`;--> statement-breakpoint
DROP TABLE `milestones`;--> statement-breakpoint
ALTER TABLE `__new_milestones` RENAME TO `milestones`;--> statement-breakpoint
PRAGMA foreign_keys=ON;