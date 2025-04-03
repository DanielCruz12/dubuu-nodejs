import { Products } from './products'
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const Tours = pgTable('tours', {
  product_id: uuid()
    .primaryKey()
    .references(() => Products.id)
    .notNull(),
  departure_point: text().notNull().default(''),
  available_dates: timestamp('available_dates', { withTimezone: true })
    .array()
    .notNull(),
  max_people: integer().notNull(),
  itinerary: text('itinerary').array().default(['']),
  highlight: text().notNull().default(''),
  included: text().notNull().default(''),
  duration: integer().notNull(),
})
