import {
  pgTable,
  uuid,
  integer,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Ratings = pgTable('ratings', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  user_id: text()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade' }),
  product_id: uuid()
    .notNull()
    .references(() => Products.id, { onDelete: 'cascade' }),
  status: boolean().notNull().default(false),
  rating: integer().notNull(),
  review: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
