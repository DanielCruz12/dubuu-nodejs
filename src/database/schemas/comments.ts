import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Users } from './users'
import { Products } from './products'

export const Comments = pgTable('comments', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: uuid()
    .references(() => Users.id)
    .notNull(),
  comment: text().notNull(),
  product_id: uuid()
    .references(() => Products.id)
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
