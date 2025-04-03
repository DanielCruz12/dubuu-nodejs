import { pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { Products } from './products';

export const ProductServices = pgTable('product_services', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
  category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
})

export const ProductServicesProducts = pgTable(
  'product_services_products',
  {
    productId: uuid('product_id')
      .references(() => Products.id)
      .notNull(),
    productServiceId: uuid('product_service_id')
      .references(() => ProductServices.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.productServiceId] })]
);

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
