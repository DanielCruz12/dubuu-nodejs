import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { BlogPosts } from './blog-posts'

export const BlogSections = pgTable('blog_sections', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  post_id: uuid()
    .notNull()
    .references(() => BlogPosts.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  content: text().notNull(),
  images: text().array().default(['']),
  videos: text().array().default(['']),
  order: integer().notNull().default(0),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
