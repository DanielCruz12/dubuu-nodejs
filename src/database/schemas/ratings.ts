import { pgTable, uuid, integer, text } from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Ratings = pgTable('ratings', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => Users.id),
  product_id: uuid()
    .notNull()
    .references(() => Products.id),
  rating: integer().notNull(),
  review: text(),
})
