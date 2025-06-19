import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Users } from './users'

export const Comments = pgTable('comments', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull(),
  comment: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
