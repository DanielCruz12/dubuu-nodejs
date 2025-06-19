import { Products } from './products'
import {
  date,
  pgTable,
  text,
  uuid,
  integer,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core'

export const Rentals = pgTable('rentals', {
  product_id: uuid()
    .primaryKey()
    .references(() => Products.id, { onDelete: 'cascade' })
    .notNull(),

  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),

  condition: text({ enum: ['new', 'used', 'refurbished'] }).default('used'),
  mileage: integer('mileage').notNull(),
  transmission: text({ enum: ['automatic', 'manual'] }).notNull(),
  seating_capacity: integer('seating_capacity').notNull(),

  pickup_location: text('pickup_location').notNull(),
  max_delivery_distance_km: integer('max_delivery_distance_km').default(15), // Ej. 15km máximo
  base_delivery_fee: decimal('base_delivery_fee', {
    precision: 10,
    scale: 2,
  }).default('2.00'),
  fee_per_km: decimal('fee_per_km', { precision: 10, scale: 2 }).default(
    '1.00',
  ),
  offers_delivery: boolean('offers_delivery').default(false),

  /**
   * Precio base de alquiler por 24 horas (1 día completo).
   *
   * El precio por hora se calcula automáticamente en el backend usando esta fórmula:
   *    price_per_hour = (price_per_day / 24) * 1.5
   *
   * De esa forma:
   *  - Si el usuario alquila solo unas horas, paga un poco más proporcionalmente.
   *  - Si alquila por el día completo o más, aplica el `price_per_day` normal.
   *
   * El cálculo final se hace restando `available_until - available_from`
   * y aplicando lógica escalonada de precios según la duración.
   */
  price_per_day: decimal('price_per_day', {
    precision: 10,
    scale: 2,
  }).notNull(),

  /**
   * Rango de fechas y horas en las que el vehículo está disponible para ser alquilado.
   * El usuario elige `available_from` y `available_until` al momento de hacer el alquiler.
   *
   * Backend valida que:
   * - No exceda 15 días.
   * - `available_until > available_from`.
   */

  available_from: date('available_from').notNull(),
  available_until: date('available_until').notNull(),
  is_available: boolean('is_available').default(true),
  fuel_type: text({
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
  }).notNull(),
  type_car: text({
    enum: ['sedan', 'SUV', 'pickup', 'truck', 'van'],
  }).notNull(),
  color: text('color').notNull(),
  doors: integer('doors').notNull(),
  engine: text('engine').notNull(),
})
