CREATE TABLE `marketing_board` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`data` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marketing_members` (
	`email` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL
);
