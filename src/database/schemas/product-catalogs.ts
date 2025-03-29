import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'

export const ProductServices = pgTable('product_services', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
  category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
})

export const ProductCategories = pgTable('product_categories', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
})

export const TargetProductAudiences = pgTable('target_product_audiences', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
})
