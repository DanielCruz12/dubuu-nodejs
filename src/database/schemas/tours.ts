import { Products } from './products'
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const Tours = pgTable('tours', {
  product_id: uuid()
    .primaryKey()
    .references(() => Products.id, { onDelete: 'cascade' })
    .notNull(),
  lat: text('lat').notNull().default(''),
  long: text('long').notNull().default(''),
  duration: integer().notNull(),
})

export const TourDates = pgTable('tour_dates', {
  id: uuid().primaryKey().defaultRandom(),
  tour_id: uuid()
    .references(() => Tours.product_id, { onDelete: 'cascade' })
    .notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  max_people: integer('max_people').notNull(),
  people_booked: integer('people_booked').notNull().default(0),
})
