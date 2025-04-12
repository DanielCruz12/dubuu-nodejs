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
  id: text().primaryKey().notNull(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),

  bank_name: varchar({ length: 255 }),
  account_number: varchar({ length: 50 }), //cuenta en donde quiere que se le deposite
  account_type: text({ enum: ['Ahorro', 'Corriente'] }).default('Ahorro'),
  first_name: varchar({ length: 255 }),
  last_name: varchar({ length: 255 }),

  id_region: text('id_region'), //SV-SS
  country: text('country'),
  city: text('city'),
  address: text('address'),
  zip_code: text('zip_code'),

  phone_number: varchar({ length: 50 }),
  role_id: uuid().references(() => Roles.id),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
