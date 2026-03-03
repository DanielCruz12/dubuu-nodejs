import { boolean, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

/**
 * Idiomas soportados. Código ISO 639-1 (ej. 'es', 'en') o con región ('pt-BR').
 * Consultar solo esta tabla para listar idiomas; las traducciones se piden por código.
 */
export const Locales = pgTable('locales', {
  code: varchar('code', { length: 10 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
