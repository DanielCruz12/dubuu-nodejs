import { pgTable, primaryKey, text, uuid, varchar } from 'drizzle-orm/pg-core'
import { Products } from './products'

export const ProductAmenities = pgTable('product_amenities', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 155 }).notNull(),
  description: text().notNull(),
  category_id: uuid()
    .references(() => ProductCategories.id)
    .notNull(),
})

export const ProductAmenitiesProducts = pgTable(
  'product_amenities_products',
  {
    productId: uuid('product_id')
      .references(() => Products.id)
      .notNull(),
    productAmenityId: uuid('product_amenity_id')
      .references(() => ProductAmenities.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.productAmenityId] })],
)

export const ProductTypes = pgTable('product_types', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 100 }).notNull(), // Ej: 'tour', 'rental', 'hotel', etc.
  description: text().notNull(),
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
