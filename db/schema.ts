import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const board = sqliteTable('marketing_board',{id:integer('id').primaryKey(),revision:integer('revision').notNull().default(0),data:text('data').notNull().default('[]'),statusConfig:text('status_config').notNull().default('{}')});
export const members = sqliteTable('marketing_members',{email:text('email').primaryKey(),role:text('role').notNull(),persona:text('persona').notNull().default('')});
export const uploads = sqliteTable('marketing_uploads',{id:text('id').primaryKey(),email:text('email').notNull()});
