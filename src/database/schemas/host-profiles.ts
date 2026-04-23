import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Users } from './users'

export const HostProfiles = pgTable('host_profiles', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  image_url: text().default('').notNull(),
  years_experience: integer().default(0).notNull(),
  languages: text().array().notNull().default([]),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
