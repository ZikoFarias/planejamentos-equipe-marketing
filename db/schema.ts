import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const board = sqliteTable('marketing_board',{id:integer('id').primaryKey(),revision:integer('revision').notNull().default(0),data:text('data').notNull().default('[]'),statusConfig:text('status_config').notNull().default('{}')});
export const members = sqliteTable('marketing_members',{email:text('email').primaryKey(),role:text('role').notNull(),persona:text('persona').notNull().default('')});
export const uploads = sqliteTable('marketing_uploads',{id:text('id').primaryKey(),email:text('email').notNull()});

export const notifications=sqliteTable('marketing_notifications',{id:integer('id').primaryKey({autoIncrement:true}),eventKey:text('event_key').notNull().unique(),email:text('email').notNull(),kind:text('kind').notNull(),taskId:text('task_id'),title:text('title').notNull(),message:text('message').notNull(),targets:text('targets').notNull().default('[]'),createdAt:text('created_at').notNull(),readAt:text('read_at'),seenAt:text('seen_at')});
export const notificationChanges=sqliteTable('marketing_notification_changes',{id:integer('id').primaryKey({autoIncrement:true}),revision:integer('revision').notNull(),taskId:text('task_id').notNull(),oldTask:text('old_task'),nextTask:text('next_task').notNull(),createdAt:text('created_at').notNull()});
export const notificationDays=sqliteTable('marketing_notification_days',{day:text('day').primaryKey(),createdAt:text('created_at').notNull()});
