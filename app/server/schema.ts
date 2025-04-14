import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Practitioners (users of the platform)
export const practitioners = sqliteTable('practitioners', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	fullName: text('full_name').notNull(),
	email: text('email').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Clients managed by practitioners
export const clients = sqliteTable('clients', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	practitionerId: integer('practitioner_id')
		.notNull()
		.references(() => practitioners.id),
	fullName: text('full_name').notNull(),
	email: text('email'),
	phone: text('phone'),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Subscription plans for practitioners
export const subscriptions = sqliteTable('subscriptions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	practitionerId: integer('practitioner_id')
		.notNull()
		.references(() => practitioners.id),
	plan: text('plan').notNull(), // e.g., 'free', 'pro', 'premium'
	startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
