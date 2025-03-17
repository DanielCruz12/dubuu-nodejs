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

export const Products = pgTable('products', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  departure_point: text().notNull(),
  is_approved: boolean().notNull().default(false),
  max_people: integer().notNull(),
  duration: integer().notNull(),
  images: text('images').array().default(['']),
  videos: text('videos').array().default(['']),
  files: text('files').array().default(['']),
  banner: text('banner'),

  product_service_id: uuid()
    .references(() => ProductServices.id)
    .notNull(),
  product_category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
  target_product_audience_id: uuid()
    .references(() => TargetProductAudiences.id)
    .notNull(),
  user_id: uuid()
    .references(() => Users.id)
    .notNull(),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
