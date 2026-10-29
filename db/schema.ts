import { pgTable, text, integer, bigint, jsonb, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import type {
  ApplicationRecord,
  ApplicationReview,
  Entitlement,
  OrderRecord,
  StoreCategory,
  SupportTicket,
  UserProfile,
} from '../src/types/store';

// Store records keep their full shape in a jsonb `data` column, with the
// fields used for lookups promoted to indexed columns.

export const categories = pgTable('categories', {
  id: text().primaryKey(),
  position: integer().notNull().default(0),
  data: jsonb().$type<StoreCategory>().notNull(),
});

export const applications = pgTable('applications', {
  id: text().primaryKey(),
  slug: text().notNull().unique(),
  position: integer().notNull().default(0),
  data: jsonb().$type<ApplicationRecord>().notNull(),
});

export const users = pgTable('users', {
  id: text().primaryKey(),
  email: text().notNull().unique(), // stored lowercase
  passwordHash: text('password_hash').notNull(),
  data: jsonb().$type<UserProfile>().notNull(),
});

export const entitlements = pgTable(
  'entitlements',
  {
    id: text().primaryKey(),
    userId: text('user_id').notNull(),
    appId: text('app_id').notNull(),
    data: jsonb().$type<Entitlement>().notNull(),
  },
  (t) => [index('entitlements_user_id_idx').on(t.userId)]
);

export const orders = pgTable(
  'orders',
  {
    id: text().primaryKey(),
    orderNumber: text('order_number').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    data: jsonb().$type<OrderRecord>().notNull(),
  },
  (t) => [index('orders_user_id_idx').on(t.userId)]
);

export const wishlists = pgTable(
  'wishlists',
  {
    userId: text('user_id').notNull(),
    appId: text('app_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.appId] })]
);

export const reviews = pgTable(
  'reviews',
  {
    id: text().primaryKey(),
    appId: text('app_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    data: jsonb().$type<ApplicationReview>().notNull(),
  },
  (t) => [index('reviews_app_id_idx').on(t.appId)]
);

export const tickets = pgTable('tickets', {
  id: text().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  data: jsonb().$type<SupportTicket>().notNull(),
});

// Short-lived signed download links (shared across function instances)
export const downloadTokens = pgTable('download_tokens', {
  token: text().primaryKey(),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  data: jsonb()
    .$type<{
      appId: string;
      buildId: string;
      userId?: string;
      filename: string;
      fileSizeBytes: number;
      sha256Checksum: string;
      platform: string;
      version: string;
    }>()
    .notNull(),
});
