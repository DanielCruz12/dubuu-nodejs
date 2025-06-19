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
  ProductTypes,
  TargetProductAudiences,
} from './product-catalogs'
import { Users } from './users'

export const Products = pgTable('products', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull(),
  description: text().notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  address: text().notNull().default(''),
  country: varchar({ length: 100 }).notNull(),
  is_approved: boolean().notNull().default(false),
  images: text('images').array().default(['']),
  files: text('files').array().default(['']),
  videos: text('videos').array().default(['']),
  banner: text('banner'),
  is_active: boolean().notNull().default(true),
  average_rating: decimal('average_rating', { precision: 8, scale: 2 }).default(
    '0',
  ),
  total_reviews: integer('total_reviews').default(0),
  target_product_audience_id: uuid()
    .references(() => TargetProductAudiences.id)
    .notNull(),
  product_category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
  product_type_id: uuid()
    .references(() => ProductTypes.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
