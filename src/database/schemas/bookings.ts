import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { Users } from './users';
import { Products } from './products';

export const Bookings = pgTable('bookings', {
  id: uuid().primaryKey().defaultRandom().notNull(),

  user_id: text().references(() => Users.id),
  product_id: uuid().references(() => Products.id),

  status: text({ enum: ['completed', 'in-process', 'canceled'] }).default('in-process'),

  // 🔽 Nuevos campos relacionados al pago
  payment_link_id: integer('payment_link_id'),
  payment_url: text('payment_url'),
  qr_url: text('qr_url'),
  is_live: boolean('is_live'),

  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
