import { eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { TourDates, Tours } from '../database/schemas'

export const getTourById = async (
  productId: string,
  baseProduct: { id: string; name: string },
) => {
  const tourData = await db
    .select({
      departure_point: Tours.departure_point,
      tour_dates: sql`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ${TourDates.id},
                'date', ${TourDates.date},
                'max_people', ${TourDates.max_people},
                'people_booked', ${TourDates.people_booked}
              )
            ) FILTER (WHERE ${TourDates.id} IS NOT NULL),
            '[]'
          )
        `.as('tour_dates'),
      itinerary: Tours.itinerary,
      highlight: Tours.highlight,
      included: Tours.included,
      duration: Tours.duration,
    })
    .from(Tours)
    .leftJoin(TourDates, eq(Tours.product_id, TourDates.tour_id))
    .where(eq(Tours.product_id, productId))
    .groupBy(Tours.product_id)
    .limit(1)

  return {
    ...baseProduct,
    tour: tourData[0] || null,
  }
}
