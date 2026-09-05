ALTER TABLE `milestones` ADD `completed` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `todos` ADD `goal_id` text;
--> statement-breakpoint
ALTER TABLE `todos` ADD `milestone_id` text;
--> statement-breakpoint
ALTER TABLE `check_ins` ADD `goal_id` text;
--> statement-breakpoint
CREATE INDEX `todos_goal_id_idx` ON `todos` (`goal_id`);
--> statement-breakpoint
CREATE INDEX `todos_milestone_id_idx` ON `todos` (`milestone_id`);
--> statement-breakpoint
CREATE INDEX `check_ins_goal_id_idx` ON `check_ins` (`goal_id`);
