import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import {
  ProductCategories,
  ProductServices,
  TargetProductAudiences,
} from './product-catalogs'
import { Users } from './users'
import { sql } from 'drizzle-orm'

export const Products = pgTable('products', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),

  departure_point: text().notNull().default(''),
  address: text().notNull().default(''),
  country: varchar({ length: 100 }).notNull(),
  available_dates: timestamp('available_dates', { withTimezone: true })
    .array()
    .notNull()
    .default(sql`'{}'`),
  itinerary: text('itinerary').array().default(['']),
  highlight: text().notNull().default(''),
  included: text().notNull().default(''),
  is_approved: boolean().notNull().default(false),
  max_people: integer().notNull(),
  duration: integer().notNull(),
  images: text('images').array().default(['']),
  videos: text('videos').array().default(['']),
  files: text('files').array().default(['']),
  banner: text('banner'),
  product_category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
  target_product_audience_id: uuid()
    .references(() => TargetProductAudiences.id)
    .notNull(),
  user_id: text()
    .references(() => Users.id)
    .notNull(),
  is_active: boolean().notNull().default(true),

  average_rating: decimal('average_rating', { precision: 8, scale: 2 }).default(
    '0',
  ),
  total_reviews: integer('total_reviews').default(0),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
