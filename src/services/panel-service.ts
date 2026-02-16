import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { Bookings } from '../database/schemas/bookings'
import { Products, TourDates, Users } from '../database/schemas'

/**
 * Todas las queries del panel se basan en las reservas (bookings) de los
 * productos que pertenecen al usuario logueado (host). No se distingue
 * entre tour, rental u otro tipo de servicio.
 */

/**
 * Cuenta de reservas activas (no canceladas) del host.
 * Incluye comparación con el mes pasado.
 */
export const getActiveReservationsCount = async (userId: string) => {
  if (!userId) {
    const err: any = new Error('userId es obligatorio.')
    err.statusCode = 400
    throw err
  }

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`${Bookings.status} != 'canceled'`,
      ),
    )
    .execute()

  const [thisMonthResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`${Bookings.status} != 'canceled'`,
        gte(Bookings.created_at, startOfThisMonth),
      ),
    )
    .execute()

  const [lastMonthResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`${Bookings.status} != 'canceled'`,
        gte(Bookings.created_at, startOfLastMonth),
        lte(Bookings.created_at, endOfLastMonth),
      ),
    )
    .execute()

  const total = totalResult?.count ?? 0
  const thisMonth = thisMonthResult?.count ?? 0
  const lastMonth = lastMonthResult?.count ?? 0
  const changeFromLastMonth = lastMonth > 0 ? thisMonth - lastMonth : 0

  return {
    total,
    changeFromLastMonth,
    thisMonth,
    lastMonth,
  }
}

/**
 * Ingresos totales del host (suma de total de reservas completadas).
 * Incluye comparación con el año pasado.
 */
export const getTotalRevenue = async (userId: string) => {
  if (!userId) {
    const err: any = new Error('userId es obligatorio.')
    err.statusCode = 400
    throw err
  }

  const now = new Date()
  const startOfThisYear = new Date(now.getFullYear(), 0, 1)
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)
  const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)

  const [thisYearResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${Bookings.total})::text, '0')`,
    })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        eq(Bookings.status, 'completed'),
        gte(Bookings.created_at, startOfThisYear),
      ),
    )
    .execute()

  const [lastYearResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${Bookings.total})::text, '0')`,
    })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        eq(Bookings.status, 'completed'),
        gte(Bookings.created_at, startOfLastYear),
        lte(Bookings.created_at, endOfLastYear),
      ),
    )
    .execute()

  const thisYearTotal = parseFloat(thisYearResult?.total ?? '0')
  const lastYearTotal = parseFloat(lastYearResult?.total ?? '0')
  const percentChange =
    lastYearTotal > 0
      ? Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100)
      : 0

  const [allTimeResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${Bookings.total})::text, '0')`,
    })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        eq(Bookings.status, 'completed'),
      ),
    )
    .execute()

  const totalRevenue = parseFloat(allTimeResult?.total ?? '0')

  return {
    total: totalRevenue,
    percentChangeFromLastYear: percentChange,
    thisYearTotal,
    lastYearTotal,
  }
}

/**
 * Viajeros frecuentes: usuarios distintos que han reservado más de una vez
 * con este host (personas en su grupo habitual).
 */
export const getFrequentTravelersCount = async (userId: string) => {
  if (!userId) {
    const err: any = new Error('userId es obligatorio.')
    err.statusCode = 400
    throw err
  }

  const frequent = await db
    .select({ guest_id: Bookings.user_id })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`${Bookings.user_id} is not null`,
        sql`${Bookings.status} != 'canceled'`,
      ),
    )
    .groupBy(Bookings.user_id)
    .having(sql`count(*) >= 2`)
    .execute()

  return {
    count: frequent?.length ?? 0,
  }
}

/**
 * Actividad de reservas: cantidad por mes en los últimos 12 meses.
 * Para el gráfico del panel.
 */
export const getReservationActivityLast12Months = async (userId: string) => {
  if (!userId) {
    const err: any = new Error('userId es obligatorio.')
    err.statusCode = 400
    throw err
  }

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const rows = await db
    .select({
      month: sql<number>`date_trunc('month', ${Bookings.created_at})::date`,
      count: sql<number>`count(*)::int`,
    })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`${Bookings.status} != 'canceled'`,
        gte(Bookings.created_at, start),
      ),
    )
    .groupBy(sql`date_trunc('month', ${Bookings.created_at})`)
    .orderBy(sql`date_trunc('month', ${Bookings.created_at})`)
    .execute()

  const monthLabels = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ]
  const byMonth: Record<string, number> = {}
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = 0
  }
  for (const r of rows) {
    const d = new Date(r.month)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = r.count
  }

  const ordered = Object.keys(byMonth)
    .sort()
    .map((key) => {
      const [y, m] = key.split('-').map(Number)
      return {
        month: key,
        label: monthLabels[m - 1],
        year: y,
        count: byMonth[key],
      }
    })

  return ordered
}

/**
 * Próximas reservas: listado de reservas (del host) con fecha futura o reciente,
 * con nombre del producto, fecha y valor. Orden por fecha (tours por tour_date, resto por created_at).
 */
export const getUpcomingReservations = async (
  userId: string,
  limit: number = 10,
) => {
  if (!userId) {
    const err: any = new Error('userId es obligatorio.')
    err.statusCode = 400
    throw err
  }

  const now = new Date()

  const rows = await db
    .select({
      id: Bookings.id,
      product_name: Products.name,
      product_banner: Products.banner,
      product_id: Products.id,
      total: Bookings.total,
      status: Bookings.status,
      tour_date: TourDates.date,
      created_at: Bookings.created_at,
      guest_first_name: Users.first_name,
      guest_last_name: Users.last_name,
    })
    .from(Bookings)
    .innerJoin(Products, eq(Bookings.product_id, Products.id))
    .leftJoin(TourDates, eq(Bookings.tour_date_id, TourDates.id))
    .leftJoin(Users, eq(Bookings.user_id, Users.id))
    .where(
      and(
        eq(Products.user_id, userId),
        sql`coalesce(${TourDates.date}, ${Bookings.created_at}) >= ${now}`,
      ),
    )
    .orderBy(
      sql`coalesce(${TourDates.date}, ${Bookings.created_at}) asc`,
    )
    .limit(limit)
    .execute()

  const upcoming = rows.map((r) => ({
      id: r.id,
      productName: r.product_name,
      productBanner: r.product_banner ?? undefined,
      productId: r.product_id,
      total: r.total,
      status: r.status,
      date: r.tour_date ?? r.created_at,
      guestName:
        [r.guest_first_name, r.guest_last_name].filter(Boolean).join(' ') ||
        null,
    }))

  return {
    reservations: upcoming,
    total: upcoming.length,
  }
}

/**
 * Resumen completo del panel en una sola llamada.
 */
export const getPanelSummary = async (userId: string) => {
  const [active, revenue, travelers, activity, upcoming] = await Promise.all([
    getActiveReservationsCount(userId),
    getTotalRevenue(userId),
    getFrequentTravelersCount(userId),
    getReservationActivityLast12Months(userId),
    getUpcomingReservations(userId, 4),
  ])

  return {
    activeReservations: active,
    totalRevenue: revenue,
    frequentTravelers: travelers,
    reservationActivity: activity,
    upcomingReservations: upcoming,
  }
}
