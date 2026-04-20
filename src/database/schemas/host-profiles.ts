import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { Users } from './users'

export const HostProfiles = pgTable('host_profiles', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  intro: text().default('').notNull(),
  description: text().default('').notNull(),
  years_experience: integer().default(0).notNull(),
  /** Card line: specialty */
  specialty: text().default('').notNull(),
  /** Card line: experience types (free text) */
  experience_summary: text().default('').notNull(),
  /** Card line: hosting / service style */
  hosting_style: text().default('').notNull(),
  experience_tags: text().array().notNull().default([]),
  languages: text().array().notNull().default([]),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
