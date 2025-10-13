import { pgTable, uuid, timestamp, unique, text } from 'drizzle-orm/pg-core'
import { BlogPosts } from './blog-posts'
import { Users } from '../users'

export const BlogPostLikes = pgTable(
  'blog_post_likes',
  {
    id: uuid().primaryKey().defaultRandom().notNull(),

    user_id: text()
      .notNull()
      .references(() => Users.id, { onDelete: 'cascade' }),
    post_id: uuid()
      .notNull()
      .references(() => BlogPosts.id, { onDelete: 'cascade' }),

    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    uniqueLike: unique().on(table.user_id, table.post_id),
  }),
)
