import { db } from '../database/db'
import { ProductAmenitiesProducts, TourDates, Tours } from '../database/schemas'

export const createRentalHandler = async (data: any, productId: string) => {
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
  } = data

  // ✅ Parsear campos que vienen como JSON strings
  let parsedAvailableDates = available_dates
  let parsedItinerary = itinerary
  let parsedExpenses = expenses
  let parsedAmenities = amenities

  try {
    // Parsear available_dates si es string
    if (typeof available_dates === 'string') {
      parsedAvailableDates = JSON.parse(available_dates)
    }

    // Parsear itinerary si es string
    if (typeof itinerary === 'string') {
      parsedItinerary = JSON.parse(itinerary)
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

  // ✅ Insertar en tabla tours
  await db.insert(Tours).values({
    product_id: productId,
    departure_point,
    itinerary: parsedItinerary,
    highlight,
    included,
    duration: numericDuration,
    expenses: parsedExpenses,
    difficulty,
    packing_list: [],
    lat: numericLat.toString(),
    long: numericLong.toString(),
  })

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
