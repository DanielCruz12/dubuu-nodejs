import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'
import { BlogCategories } from './blog-categories'
import { Users } from '../users'

export const BlogPosts = pgTable('blog_posts', {
  id: uuid().primaryKey().defaultRandom().notNull(),

  title: text().notNull(),
  slug: text().notNull().unique(),
  reading_time_minutes: integer().notNull().default(3),
  author_bio: text(),
  cover_image: text(),

  is_approved: boolean().notNull().default(false),
  is_published: boolean().notNull().default(false),

  user_id: text()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade' }),
  category_id: uuid().references(() => BlogCategories.id, {
    onDelete: 'set null',
  }),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
