CREATE TABLE `marketing_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `marketing_members` ADD `persona` text DEFAULT '' NOT NULL;