import { db } from '../database/db'
import { ProductAmenitiesProducts, TourDates, Tours } from '../database/schemas'
import { saveTourWithTranslations } from '../services/tour-translations-service'
import { getEnabledLocales } from '../services/translation-service'

export const createTourHandler = async (data: any, productId: string) => {
  const {
    departure_point,
    available_dates,
    max_people,
    itinerary = [],
    highlight,
    expenses = [],
    difficulty = '',
    included,
    duration,
    amenities = [],
    lat,
    long,
    packing_list = [],
    locale: requestedLocale,
  } = data
  const enabled = getEnabledLocales()
  const tourLocale =
    requestedLocale?.trim()?.toLowerCase() && enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined

  // ✅ Parsear campos que vienen como JSON strings
  let parsedAvailableDates = available_dates
  let parsedItinerary = itinerary
  let parsedExpenses = expenses
  let parsedAmenities = amenities
  let parsedPackingList = packing_list

  try {
    // Parsear available_dates si es string
    if (typeof available_dates === 'string') {
      parsedAvailableDates = JSON.parse(available_dates)
    }

    // Parsear itinerary si es string
    if (typeof itinerary === 'string') {
      parsedItinerary = JSON.parse(itinerary)
    }

    // Parsear packing_list si es string
    if (typeof packing_list === 'string') {
      parsedPackingList = JSON.parse(packing_list)
    } else {
      parsedPackingList = packing_list
    }

    // Parsear expenses si es string
    if (typeof expenses === 'string') {
      parsedExpenses = JSON.parse(expenses)
    }

    // Parsear amenities si es string
    if (typeof amenities === 'string') {
      parsedAmenities = JSON.parse(amenities)
    }
  } catch (error) {
    throw new Error('Error al parsear los datos JSON del tour.')
  }

  // ✅ Convertir números
  const numericMaxPeople = Number(max_people)
  const numericDuration = Number(duration)
  const numericLat = Number(lat)
  const numericLong = Number(long)

  // ✅ Validaciones
  if (
    !departure_point ||
    !parsedAvailableDates ||
    !Array.isArray(parsedAvailableDates) ||
    parsedAvailableDates.length === 0 ||
    !max_people ||
    isNaN(numericMaxPeople) ||
    !difficulty ||
    !highlight ||
    !included ||
    !duration ||
    isNaN(numericDuration)
  ) {
    throw new Error('Faltan campos obligatorios para el producto tipo Tour.')
  }

  // ✅ Validar fechas
  const parsedDates = parsedAvailableDates.map((date: string) => {
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
      throw new Error(`La fecha '${date}' no es válida.`)
    }
    return parsed
  })

  await db.insert(Tours).values({
    product_id: productId,
    duration: numericDuration,
    lat: numericLat.toString(),
    long: numericLong.toString(),
  })

  await saveTourWithTranslations(
    productId,
    {
      departure_point,
      difficulty,
      highlight,
      included,
      itinerary: parsedItinerary,
      packing_list: parsedPackingList,
      expenses: parsedExpenses,
    },
    tourLocale,
  )

  const tourDateRows = parsedDates.map((date) => ({
    tour_id: productId,
    date,
    max_people: numericMaxPeople,
    people_booked: 0,
  }))
  await db.insert(TourDates).values(tourDateRows).execute()

  // ✅ Insertar amenities relacionados (solo si hay amenities)
  if (Array.isArray(parsedAmenities) && parsedAmenities.length > 0) {
    const amenityRows = parsedAmenities.map((amenityId: string) => ({
      productId: productId,
      productAmenityId: amenityId,
    }))

    await db.insert(ProductAmenitiesProducts).values(amenityRows).execute()
  }
}
