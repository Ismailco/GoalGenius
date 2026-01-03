import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Subscription plans
export const subscriptions = sqliteTable('subscriptions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	plan: text('plan').notNull(), // e.g., 'free', 'pro', 'premium'
	startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const goals = sqliteTable('goals', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	category: text('category', { enum: ['health', 'career', 'learning', 'relationships'] }).notNull(),
	timeFrame: text('time_frame').notNull(),
	status: text('status', { enum: ['not-started', 'in-progress', 'completed'] }).notNull(),
	progress: integer('progress').notNull(),
	dueDate: text('due_date'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('goals_user_id_idx').on(table.userId),
}));

export const milestones = sqliteTable('milestones', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').notNull().references(() => goals.id, {onDelete: 'cascade'}),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('milestones_user_id_idx').on(table.userId),
	goalIdIdx: index('milestones_goal_id_idx').on(table.goalId),
}));

export const notes = sqliteTable('notes', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	category: text('category'),
	isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('notes_user_id_idx').on(table.userId),
}));

export const todos = sqliteTable('todos', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull(),
	dueDate: text('due_date'),
	category: text('category'),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('todos_user_id_idx').on(table.userId),
	userIdCompletedIdx: index('todos_user_id_completed_idx').on(table.userId, table.completed),
}));

export const checkIns = sqliteTable('check_ins', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	date: text('date').notNull(),
	mood: text('mood', { enum: ['great', 'good', 'okay', 'bad', 'terrible'] }).notNull(),
	energy: text('energy', { enum: ['high', 'medium', 'low'] }).notNull(),
	accomplishments: text('accomplishments').notNull(), // JSON string array
	challenges: text('challenges').notNull(), // JSON string array
	goals: text('goals').notNull(), // JSON string array
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('check_ins_user_id_idx').on(table.userId),
}));

