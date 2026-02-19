import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { Users } from './users'

export const PaymentAccounts = pgTable('payment_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text()
    .references(() => Users.id, { onDelete: 'cascade' })
    .notNull(),
  bank_name: text('bank_name'), // obligatorio solo si payment_method !== 'blink'
  account_type: text('account_type'), // ahorro, corriente, etc.
  account_number: text('account_number'),
  holder_name: text('holder_name'),
  email: text('email'), // recomendado para todos; obligatorio para algunos métodos
  payment_method: text('payment_method').notNull(), // bank, paypal, blink, etc.
  blink_wallet_address: text('blink_wallet_address'), // Lightning address o wallet ID cuando payment_method === 'blink'
  createdAt: timestamp('created_at').defaultNow(),
})
