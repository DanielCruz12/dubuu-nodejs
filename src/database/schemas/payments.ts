import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { Users } from './users'

export const PaymentAccounts = pgTable('payment_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull(),
  bank_name: text('bank_name').notNull(),
  account_type: text('account_type').notNull(), // ahorro, corriente, etc.
  account_number: text('account_number').notNull(),
  holder_name: text('holder_name').notNull(),
  email: text('email').notNull(),
  payment_method: text('payment_method').notNull(), // ejemplo: bank, paypal, etc.
  createdAt: timestamp('created_at').defaultNow(),
})
