import { and, eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { TourDates, TourTranslations, Tours } from '../database/schemas'
import { getDefaultLocale } from '../services/translation-service'

export const getTourById = async (
  productId: string,
  baseProduct: { id: string; name: string },
  locale?: string,
) => {
  const lang = locale ?? getDefaultLocale()
  const tourData = await db
    .select({
      departure_point: TourTranslations.departure_point,
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
      itinerary: TourTranslations.itinerary,
      lat: Tours.lat,
      long: Tours.long,
      expenses: TourTranslations.expenses,
      difficulty: TourTranslations.difficulty,
      packing_list: TourTranslations.packing_list,
      highlight: TourTranslations.highlight,
      included: TourTranslations.included,
      duration: Tours.duration,
    })
    .from(Tours)
    .innerJoin(
      TourTranslations,
      and(
        eq(Tours.product_id, TourTranslations.product_id),
        eq(TourTranslations.locale, lang),
      ),
    )
    .leftJoin(TourDates, eq(Tours.product_id, TourDates.tour_id))
    .where(eq(Tours.product_id, productId))
    .groupBy(
      Tours.product_id,
      TourTranslations.departure_point,
      TourTranslations.itinerary,
      TourTranslations.expenses,
      TourTranslations.difficulty,
      TourTranslations.packing_list,
      TourTranslations.highlight,
      TourTranslations.included,
      Tours.lat,
      Tours.long,
      Tours.duration,
    )
    .limit(1)

  return {
    ...baseProduct,
    tour: tourData[0] || null,
  }
}
