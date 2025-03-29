import { pgTable, uuid, text } from 'drizzle-orm/pg-core'
import { Products } from './products'
import { Users } from './users'

export const Faqs = pgTable('faqs', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  user_id: text()
  .references(() => Users.id)
  .notNull(),
  product_id: uuid()
    .references(() => Products.id)
    .notNull(),
})
