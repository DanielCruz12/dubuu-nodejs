import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const BlogCategories = pgTable('blog_categories', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
