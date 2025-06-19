import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'
import { TourDates } from './tours'

export const Bookings = pgTable('bookings', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: text().references(() => Users.id, {
    onDelete: 'cascade',
  }),
  product_id: uuid().references(() => Products.id, {
    onDelete: 'cascade',
  }),
  status: text({ enum: ['completed', 'in-process', 'canceled'] }).default(
    'in-process',
  ),
  is_live: boolean('is_live'),
  tickets: integer('tickets').default(1),
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  tour_date_id: uuid().references(() => TourDates.id, {
    onDelete: 'cascade',
  }),
  paymentMethod: text('paymentMethod'),
  idTransaccion: text('idTransaccion'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
