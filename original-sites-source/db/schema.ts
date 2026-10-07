// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const learnerStates = sqliteTable('learner_states', {
  userId: text('user_id').primaryKey(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
export const members=sqliteTable('members',{email:text('email').primaryKey(),userId:text('user_id').unique(),name:text('name').notNull(),role:text('role').notNull().default('learner'),department:text('department').notNull().default('Unassigned')});
export const organizationSettings=sqliteTable('organization_settings',{id:text('id').primaryKey(),payload:text('payload').notNull(),updatedAt:text('updated_at').notNull()});

export const contentLibrary=sqliteTable('content_library',{id:text('id').primaryKey(),title:text('title').notNull(),department:text('department').notNull(),language:text('language').notNull(),level:text('level').notNull(),payload:text('payload').notNull(),createdAt:text('created_at').notNull()});

export const sourceDocuments=sqliteTable('source_documents',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),filename:text('filename').notNull(),referenceKind:text('reference_kind').notNull(),semantic:integer('semantic').notNull().default(0),createdAt:text('created_at').notNull()},t=>[index('source_owner_idx').on(t.ownerId)]);
export const sourceVectors=sqliteTable('source_vectors',{id:text('id').primaryKey(),sourceId:text('source_id').notNull(),chunkId:text('chunk_id').notNull(),page:integer('page').notNull(),content:text('content').notNull(),vector:text('vector')},t=>[index('vector_source_idx').on(t.sourceId)]);
export const generatedAssets=sqliteTable('generated_assets',{id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),objectKey:text('object_key').notNull(),activityId:text('activity_id').notNull(),createdAt:text('created_at').notNull()},t=>[index('asset_owner_activity_idx').on(t.ownerId,t.activityId)]);
export const reminderPreferences=sqliteTable('reminder_preferences',{userId:text('user_id').primaryKey(),email:text('email').notNull(),enabled:integer('enabled').notNull().default(0),cadenceDays:integer('cadence_days').notNull().default(1)});
export const emailDeliveries=sqliteTable('email_deliveries',{id:text('id').primaryKey(),userId:text('user_id').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull()},t=>[index('delivery_user_date_idx').on(t.userId,t.createdAt)]);
