import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Bookings = pgTable('bookings', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: uuid()
    .references(() => Users.id)
    .notNull(),
  product_id: uuid()
    .references(() => Products.id)
    .notNull(),
  status: text({ enum: ['completed', 'in-process', 'canceled'] }).default(
    'in-process',
  ),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
