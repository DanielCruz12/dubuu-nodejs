import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const Roles = pgTable('user_roles', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  permissions: text().array().default(['user']),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const Users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  bank_name: varchar({ length: 255 }),
  account_number: varchar({ length: 50 }),
  first_name: varchar({ length: 255 }),
  last_name: varchar({ length: 255 }),
  // Campo adicional por si el nombre del titular es distinto
  account_holder_name: varchar({ length: 255 }),
  phone_number: varchar({ length: 50 }),
  account_type: text({ enum: ['Ahorro', 'Corriente'] }).default('Ahorro'),
  role_id: uuid()
    .notNull()
    .default('31e73e39-521a-434d-b174-58ab49668369')
    .references(() => Roles.id),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
