import { db } from '../database/db'
import { ProductAmenitiesProducts, TourDates, Tours } from '../database/schemas'
import { saveTourWithTranslations } from '../services/tour-translations-service'
import { getEnabledLocales } from '../services/translation-service'
import { TourDateStatus } from '../constants/enums'
import type { TourDateCreateInput } from '../types/tour'

export function parsePriceToDecimalString(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(n) || n <= 0) {
    throw new Error('Cada fecha debe tener un precio válido mayor que 0.')
  }
  return n.toFixed(2)
}

function normalizeTourDateRows(
  parsedAvailableDates: TourDateCreateInput[],
  defaultPrice: number | string | undefined,
  defaultMaxPeople: number,
): Array<{
  date: Date
  price: string
  max_people: number
  status: (typeof TourDateStatus)[keyof typeof TourDateStatus]
}> {
  if (!parsedAvailableDates.length) {
    throw new Error('Debe haber al menos una fecha disponible.')
  }

  const first = parsedAvailableDates[0]
  const isObjectRows =
    typeof first === 'object' &&
    first !== null &&
    'date' in first &&
    typeof (first as { date: unknown }).date === 'string'

  if (isObjectRows) {
    return parsedAvailableDates.map((row) => {
      const r = row as {
        date: string
        price?: number | string
        max_people?: number | string
        status?: string
      }
      const parsed = new Date(r.date)
      if (isNaN(parsed.getTime())) {
        throw new Error(`La fecha '${r.date}' no es válida.`)
      }
      const rawPrice = r.price ?? defaultPrice
      if (rawPrice === undefined) {
        throw new Error(
          'Cada fecha debe incluir precio o debes enviar un precio por defecto (price).',
        )
      }
      const mp = Number(r.max_people ?? defaultMaxPeople)
      if (isNaN(mp) || mp <= 0) {
        throw new Error('max_people debe ser un número válido mayor que 0.')
      }
      const st = r.status ?? TourDateStatus.ACTIVE
      if (
        st !== TourDateStatus.ACTIVE &&
        st !== TourDateStatus.CANCELLED &&
        st !== TourDateStatus.COMPLETED
      ) {
        throw new Error(
          `Estado de fecha inválido: ${st}. Usa active, cancelled o completed.`,
        )
      }
      return {
        date: parsed,
        price: parsePriceToDecimalString(rawPrice),
        max_people: mp,
        status: st,
      }
    })
  }

  if (defaultPrice === undefined) {
    throw new Error(
      'Para fechas solo en texto (ISO), el campo price del tour es obligatorio.',
    )
  }
  const priceStr = parsePriceToDecimalString(defaultPrice)

  return (parsedAvailableDates as string[]).map((dateStr) => {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) {
      throw new Error(`La fecha '${dateStr}' no es válida.`)
    }
    return {
      date: parsed,
      price: priceStr,
      max_people: defaultMaxPeople,
      status: TourDateStatus.ACTIVE,
    }
  })
}

export const createTourHandler = async (data: any, productId: string) => {
  const {
    departure_point,
    available_dates,
    max_people,
    price,
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
    requestedLocale?.trim()?.toLowerCase() &&
    enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined

  let parsedAvailableDates: TourDateCreateInput[] = available_dates
  let parsedItinerary = itinerary
  let parsedExpenses = expenses
  let parsedAmenities = amenities
  let parsedPackingList = packing_list

  try {
    if (typeof available_dates === 'string') {
      parsedAvailableDates = JSON.parse(available_dates)
    }

    if (typeof itinerary === 'string') {
      parsedItinerary = JSON.parse(itinerary)
    }

    if (typeof packing_list === 'string') {
      parsedPackingList = JSON.parse(packing_list)
    } else {
      parsedPackingList = packing_list
    }

    if (typeof expenses === 'string') {
      parsedExpenses = JSON.parse(expenses)
    }

    if (typeof amenities === 'string') {
      parsedAmenities = JSON.parse(amenities)
    }
  } catch {
    throw new Error('Error al parsear los datos JSON del tour.')
  }

  const numericMaxPeople = Number(max_people)
  const numericDuration = Number(duration)
  const numericLat = Number(lat)
  const numericLong = Number(long)

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

  const dateRows = normalizeTourDateRows(
    parsedAvailableDates,
    price,
    numericMaxPeople,
  )

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

  const tourDateRows = dateRows.map((row) => ({
    tour_id: productId,
    date: row.date,
    max_people: row.max_people,
    people_booked: 0,
    price: row.price,
    status: row.status,
  }))
  await db.insert(TourDates).values(tourDateRows).execute()

  if (Array.isArray(parsedAmenities) && parsedAmenities.length > 0) {
    const amenityRows = parsedAmenities.map((amenityId: string) => ({
      productId: productId,
      productAmenityId: amenityId,
    }))

    await db.insert(ProductAmenitiesProducts).values(amenityRows).execute()
  }
}
