CREATE INDEX `check_ins_user_id_idx` ON `check_ins` (`user_id`);--> statement-breakpoint
CREATE INDEX `goals_user_id_idx` ON `goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `milestones_user_id_idx` ON `milestones` (`user_id`);--> statement-breakpoint
CREATE INDEX `milestones_goal_id_idx` ON `milestones` (`goal_id`);--> statement-breakpoint
CREATE INDEX `notes_user_id_idx` ON `notes` (`user_id`);--> statement-breakpoint
CREATE INDEX `todos_user_id_idx` ON `todos` (`user_id`);--> statement-breakpoint
CREATE INDEX `todos_user_id_completed_idx` ON `todos` (`user_id`,`completed`);