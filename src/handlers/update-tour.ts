import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import {
  ProductAmenitiesProducts,
  TourDates,
  TourTranslations,
  Tours,
} from '../database/schemas'
import { TourDateStatus, type TourDateStatusType } from '../constants/enums'
import { saveTourWithTranslations } from '../services/tour-translations-service'
import {
  getDefaultLocale,
  getEnabledLocales,
  type TourTranslatableFields,
} from '../services/translation-service'
import { parsePriceToDecimalString } from './create-tour'
import type { TourDateCreateInput } from '../types/tour'

function parseTourDateStatus(st: string): TourDateStatusType {
  const v = st.trim().toLowerCase()
  if (
    v !== TourDateStatus.ACTIVE &&
    v !== TourDateStatus.CANCELLED &&
    v !== TourDateStatus.COMPLETED
  ) {
    throw new Error(
      `Estado de fecha inválido: ${st}. Usa active, cancelled o completed.`,
    )
  }
  return v as TourDateStatusType
}

async function mergeTourTranslationsFromDb(
  productId: string,
  incoming: Record<string, unknown>,
  locale?: string,
): Promise<{ fields: TourTranslatableFields; tourLocale?: string }> {
  const enabled = getEnabledLocales()
  const localeStr =
    typeof locale === 'string' ? locale.trim().toLowerCase() : ''
  const loc =
    localeStr && enabled.includes(localeStr) ? localeStr : getDefaultLocale()

  const [row] = await db
    .select({
      departure_point: TourTranslations.departure_point,
      difficulty: TourTranslations.difficulty,
      highlight: TourTranslations.highlight,
      included: TourTranslations.included,
      itinerary: TourTranslations.itinerary,
      packing_list: TourTranslations.packing_list,
      expenses: TourTranslations.expenses,
    })
    .from(TourTranslations)
    .where(
      and(
        eq(TourTranslations.product_id, productId),
        eq(TourTranslations.locale, loc),
      ),
    )
    .limit(1)

  const base: TourTranslatableFields = {
    departure_point: row?.departure_point ?? '',
    difficulty: row?.difficulty ?? '',
    highlight: row?.highlight ?? '',
    included: row?.included ?? '',
    itinerary: (row?.itinerary as string[]) ?? [],
    packing_list: (row?.packing_list as string[]) ?? [],
    expenses: (row?.expenses as string[]) ?? [],
  }

  const keys: (keyof TourTranslatableFields)[] = [
    'departure_point',
    'difficulty',
    'highlight',
    'included',
    'itinerary',
    'packing_list',
    'expenses',
  ]

  for (const k of keys) {
    if (incoming[k] !== undefined) {
      let v = incoming[k]
      if (
        typeof v === 'string' &&
        (k === 'itinerary' || k === 'packing_list' || k === 'expenses')
      ) {
        try {
          v = JSON.parse(v)
        } catch {
          throw new Error(`Error al parsear el campo JSON del tour: ${k}`)
        }
      }
      ;(base as Record<string, unknown>)[k] = v
    }
  }

  const tourLocale =
    localeStr && enabled.includes(localeStr) ? localeStr : undefined

  return { fields: base, tourLocale }
}

async function syncTourDatesFromAvailableDates(
  productId: string,
  rawDates: TourDateCreateInput[],
  defaultPrice: number | string | undefined,
  defaultMaxPeople: number,
) {
  if (!rawDates.length) {
    throw new Error('Debe haber al menos una fecha disponible.')
  }

  const first = rawDates[0]
  const isObjectRows =
    typeof first === 'object' &&
    first !== null &&
    'date' in first &&
    typeof (first as { date: unknown }).date === 'string'

  if (!isObjectRows) {
    throw new Error(
      'Para actualizar fechas envía objetos con date (y opcionalmente id, price, max_people, status).',
    )
  }

  const existingRows = await db
    .select()
    .from(TourDates)
    .where(eq(TourDates.tour_id, productId))

  const existingById = new Map(existingRows.map((r) => [r.id, r]))
  const incomingIds = new Set(
    (rawDates as { id?: string }[])
      .map((r) => r.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  )

  for (const row of existingRows) {
    if (!incomingIds.has(row.id)) {
      if (row.people_booked > 0) {
        throw new Error(
          `No puedes eliminar la fecha ${row.date.toISOString()} porque tiene reservas.`,
        )
      }
      await db.delete(TourDates).where(eq(TourDates.id, row.id))
    }
  }

  for (const item of rawDates as Array<{
    id?: string
    date: string
    price?: number | string
    max_people?: number | string
    status?: string
  }>) {
    const parsed = new Date(item.date)
    if (isNaN(parsed.getTime())) {
      throw new Error(`La fecha '${item.date}' no es válida.`)
    }
    const rawPrice = item.price ?? defaultPrice
    if (rawPrice === undefined) {
      throw new Error(
        'Cada fecha debe incluir precio o debes enviar un precio por defecto (price).',
      )
    }
    const priceStr = parsePriceToDecimalString(rawPrice)
    const mp = Number(item.max_people ?? defaultMaxPeople)
    if (isNaN(mp) || mp <= 0) {
      throw new Error('max_people debe ser un número válido mayor que 0.')
    }
    const st = String(item.status ?? TourDateStatus.ACTIVE)
    const status = parseTourDateStatus(st)

    if (item.id && existingById.has(item.id)) {
      const prev = existingById.get(item.id)!
      if (mp < prev.people_booked) {
        throw new Error(
          `El máximo de personas no puede ser menor que las reservas actuales (${prev.people_booked}).`,
        )
      }
      await db
        .update(TourDates)
        .set({
          date: parsed,
          price: priceStr,
          max_people: mp,
          status,
        })
        .where(
          and(eq(TourDates.id, item.id), eq(TourDates.tour_id, productId)),
        )
    } else {
      await db.insert(TourDates).values({
        tour_id: productId,
        date: parsed,
        max_people: mp,
        people_booked: 0,
        price: priceStr,
        status,
      })
    }
  }
}

export function hasTourPayloadFields(data: Record<string, unknown>): boolean {
  if (data.available_dates !== undefined) return true
  if (data.amenities !== undefined) return true
  const keys = [
    'departure_point',
    'difficulty',
    'highlight',
    'included',
    'itinerary',
    'packing_list',
    'expenses',
    'lat',
    'long',
    'duration',
  ]
  return keys.some((k) => data[k] !== undefined)
}

function hasTourTranslationKeys(data: Record<string, unknown>): boolean {
  const keys = [
    'departure_point',
    'difficulty',
    'highlight',
    'included',
    'itinerary',
    'packing_list',
    'expenses',
  ]
  return keys.some((k) => data[k] !== undefined)
}

function hasTourGeoKeys(data: Record<string, unknown>): boolean {
  return (
    data.lat !== undefined ||
    data.long !== undefined ||
    data.duration !== undefined
  )
}

export async function updateTourHandler(
  productId: string,
  data: Record<string, unknown>,
) {
  const [tourRow] = await db
    .select({ product_id: Tours.product_id })
    .from(Tours)
    .where(eq(Tours.product_id, productId))
    .limit(1)

  if (!tourRow) {
    throw new Error('Este producto no es un tour o no tiene registro de tour.')
  }

  const {
    available_dates: rawAvailable,
    max_people,
    price,
    amenities: rawAmenities,
    lat,
    long,
    duration,
    locale: requestedLocale,
  } = data

  let parsedAvailableDates: TourDateCreateInput[] | undefined
  if (rawAvailable === undefined) {
    parsedAvailableDates = undefined
  } else if (typeof rawAvailable === 'string') {
    try {
      parsedAvailableDates = JSON.parse(rawAvailable) as TourDateCreateInput[]
    } catch {
      throw new Error('Error al parsear available_dates del tour.')
    }
  } else if (Array.isArray(rawAvailable)) {
    parsedAvailableDates = rawAvailable as TourDateCreateInput[]
  } else {
    throw new Error('available_dates debe ser un array.')
  }

  const numericMaxPeople = Number(max_people)
  const defaultMaxPeople =
    !isNaN(numericMaxPeople) && numericMaxPeople > 0
      ? numericMaxPeople
      : 10

  if (parsedAvailableDates !== undefined && Array.isArray(parsedAvailableDates)) {
    await syncTourDatesFromAvailableDates(
      productId,
      parsedAvailableDates,
      price as number | string | undefined,
      defaultMaxPeople,
    )
  }

  if (hasTourGeoKeys(data)) {
    const [current] = await db
      .select()
      .from(Tours)
      .where(eq(Tours.product_id, productId))
      .limit(1)
    if (!current) {
      throw new Error('Tour no encontrado.')
    }
    const nextLat = lat !== undefined ? Number(lat) : Number(current.lat)
    const nextLong = long !== undefined ? Number(long) : Number(current.long)
    const nextDuration =
      duration !== undefined ? Number(duration) : current.duration
    if (lat !== undefined && isNaN(nextLat)) {
      throw new Error('lat debe ser un número válido.')
    }
    if (long !== undefined && isNaN(nextLong)) {
      throw new Error('long debe ser un número válido.')
    }
    if (duration !== undefined && isNaN(nextDuration)) {
      throw new Error('duration debe ser un número válido.')
    }
    await db
      .update(Tours)
      .set({
        ...(lat !== undefined ? { lat: String(nextLat) } : {}),
        ...(long !== undefined ? { long: String(nextLong) } : {}),
        ...(duration !== undefined ? { duration: nextDuration } : {}),
      })
      .where(eq(Tours.product_id, productId))
  }

  if (hasTourTranslationKeys(data)) {
    const enabled = getEnabledLocales()
    const localeStr =
      typeof requestedLocale === 'string'
        ? requestedLocale.trim().toLowerCase()
        : ''
    const loc =
      localeStr && enabled.includes(localeStr) ? localeStr : undefined
    const { fields, tourLocale } = await mergeTourTranslationsFromDb(
      productId,
      data,
      loc,
    )
    await saveTourWithTranslations(productId, fields, tourLocale)
  }

  if (rawAmenities !== undefined) {
    let parsedAmenities = rawAmenities
    if (typeof rawAmenities === 'string') {
      try {
        parsedAmenities = JSON.parse(rawAmenities)
      } catch {
        throw new Error('Error al parsear amenities del tour.')
      }
    }
    if (!Array.isArray(parsedAmenities)) {
      throw new Error('amenities debe ser un array.')
    }
    await db
      .delete(ProductAmenitiesProducts)
      .where(eq(ProductAmenitiesProducts.productId, productId))
    if (parsedAmenities.length > 0) {
      const amenityRows = parsedAmenities.map((amenityId: string) => ({
        productId,
        productAmenityId: amenityId,
      }))
      await db.insert(ProductAmenitiesProducts).values(amenityRows).execute()
    }
  }
}
