import { pgTable, uuid, text } from 'drizzle-orm/pg-core'

export const Faqs = pgTable('faqs', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  category: text({ enum: ['car', 'tour'] }).default('tour'),
})
