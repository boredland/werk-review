import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash'),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	verifyToken: text('verify_token'),
	resetToken: text('reset_token'),
	resetTokenExpiry: text('reset_token_expiry'),
	banned: integer('banned', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const reviews = sqliteTable('reviews', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	workId: text('work_id').notNull(),
	rating: integer('rating').notNull(),
	ratingLabel: text('rating_label').notNull(),
	title: text('title'),
	body: text('body'),
	version: text('version'),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const authorPhotos = sqliteTable('author_photos', {
	authorId: text('author_id').primaryKey(),
	r2Key: text('r2_key').notNull(),
	description: text('description'),
	sourceLabel: text('source_label'),
	sourceUrl: text('source_url'),
	uploadedBy: text('uploaded_by').references(() => users.id),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const bookmarks = sqliteTable('bookmarks', {
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	workId: text('work_id').notNull(),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const authorSuggestions = sqliteTable('author_suggestions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	suggestedName: text('suggested_name').notNull(),
	note: text('note'),
	status: text('status').notNull().default('pending'),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});
