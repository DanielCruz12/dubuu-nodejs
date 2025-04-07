import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Bookings = pgTable('bookings', {
  id: uuid().primaryKey().defaultRandom().notNull(),

  user_id: text().references(() => Users.id),
  product_id: uuid().references(() => Products.id),

  status: text({ enum: ['completed', 'in-process', 'canceled'] }).default(
    'in-process',
  ),
  is_live: boolean('is_live'),
  tickets: integer('tickets').default(1),
  total: integer('total').default(0),

  first_name: text('first_name'),
  last_name: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  id_region: text('id_region'),
  country: text('country'),
  zip_code: text('zip_code'),
  paymentMethod: text('paymentMethod'),
  idTransaccion: text('idTransaccion'),
  urlCompletarPago3Ds: text('urlCompletarPago3Ds'),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
