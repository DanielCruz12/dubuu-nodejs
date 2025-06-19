import { eq } from 'drizzle-orm'
import { Rentals } from '../database/schemas'
import { db } from '../database/db'

export const getRentalById = async (
  productId: string,
  baseProduct: { id: string; name: string },
) => {
  const rentalData = await db
    .select({
      brand: Rentals.brand,
      model: Rentals.model,
      year: Rentals.year,
      condition: Rentals.condition,
      mileage: Rentals.mileage,
      transmission: Rentals.transmission,
      seating_capacity: Rentals.seating_capacity,
      pickup_location: Rentals.pickup_location,
      max_delivery_distance_km: Rentals.max_delivery_distance_km,
      base_delivery_fee: Rentals.base_delivery_fee,
      fee_per_km: Rentals.fee_per_km,
      offers_delivery: Rentals.offers_delivery,
      price_per_day: Rentals.price_per_day,
      available_from: Rentals.available_from,
      available_until: Rentals.available_until,
      fuel_type: Rentals.fuel_type,
      is_available: Rentals.is_available,

      type_car: Rentals.type_car,
      color: Rentals.color,
      doors: Rentals.doors,
      engine: Rentals.engine,
    })
    .from(Rentals)
    .where(eq(Rentals.product_id, productId))
    .groupBy(Rentals.product_id)
    .limit(1)
  return {
    ...baseProduct,
    rental: rentalData[0] || null,
  }
}
