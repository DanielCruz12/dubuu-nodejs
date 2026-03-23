import { Products } from './products'
import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  decimal,
} from 'drizzle-orm/pg-core'

/** Debe coincidir con `TourDateStatus` en `constants/enums` */
const tourDateStatusValues = ['active', 'cancelled', 'completed'] as const

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
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  /** Por fecha: cancelación del host, tour ya realizado, etc. */
  status: text('status', { enum: tourDateStatusValues })
    .notNull()
    .default('active'),
})
