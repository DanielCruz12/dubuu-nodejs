import { pgTable, uuid, text } from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Favorites = pgTable('favorites', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  user_id: text()
    .notNull()
    .references(() => Users.id),
  product_id: uuid()
    .notNull()
    .references(() => Products.id),
})
