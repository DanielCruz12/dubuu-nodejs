import { and, eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { Bookings } from '../database/schemas/bookings'
import { statusCodes } from '../utils'
import {
  ProductTranslations,
  Products,
  TourDates,
  Users,
} from '../database/schemas'
import { getDefaultLocale } from './translation-service'
import moment from 'moment'
import 'moment/locale/es'
import { decrypt } from '../utils/crypto'
import { BookingStatus } from '../constants'

// 🔍 Obtener todas las reservas de un usuario (para getUserBookings)
export const getUserBookingsService = async (
  userId: string,
  locale?: string,
) => {
  if (!userId) {
    const error: any = new Error('El ID del usuario es obligatorio.')
    error.statusCode = 400
    throw error
  }

  const lang = locale ?? getDefaultLocale()

  try {
    const bookings = await db
      .select({
        id: Bookings.id,
        tickets: Bookings.tickets,
        total: Bookings.total,
        status: Bookings.status,
        product_id: Bookings.product_id,
        product_name: ProductTranslations.name,
        product_banner: Products.banner,
        product_address: ProductTranslations.address,
        country: Products.country,
        product_description: ProductTranslations.description,
        tourDate: TourDates.date,
      })
      .from(Bookings)
      .leftJoin(Products, eq(Bookings.product_id, Products.id))
      .leftJoin(
        ProductTranslations,
        and(
          eq(Bookings.product_id, ProductTranslations.product_id),
          eq(ProductTranslations.locale, lang),
        ),
      )
      .leftJoin(TourDates, eq(Bookings.tour_date_id, TourDates.id))
      .where(eq(Bookings.user_id, userId))
      .execute()

    // Sin reservas es válido: devolver array vacío, no error
    return Array.isArray(bookings) ? bookings : []
  } catch (error: any) {
    if (!error.statusCode) {
      const err: any = new Error('Error al obtener las reservas del usuario.')
      err.statusCode = 500
      throw err
    }
    throw error
  }
}

export const getBookingsByUserIdProductIdService = async (
  userId: string,
  productId: string,
  locale?: string,
) => {
  if (!productId) {
    const error: any = new Error('El ID del producto es obligatorio.')
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  if (!userId) {
    const error: any = new Error('El ID del usuario es obligatorio.')
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  const lang = locale ?? getDefaultLocale()

  try {
    const userExistsInProduct = await db
      .select()
      .from(Products)
      .where(eq(Products.user_id, userId))
      .execute()

    if (!userExistsInProduct || userExistsInProduct.length === 0) {
      const error: any = new Error(
        'El usuario no está asociado a este producto.',
      )
      error.statusCode = 403
      console.error('403:', error.message)
      throw error
    }

    const bookings = await db
      .select({
        bookingId: Bookings.id,
        tickets: Bookings.tickets,
        total: Bookings.total,
        productId: Bookings.product_id,
        user: {
          first_name: Users.first_name,
          username: Users.username,
          last_name: Users.last_name,
          email: Users.email,
        },
        status: Bookings.status,
        name: ProductTranslations.name,
        tourDate: TourDates.date,
        createdAt: Bookings.created_at,
        updatedAt: Bookings.updated_at,
      })
      .from(Bookings)
      .leftJoin(Products, eq(Bookings.product_id, Products.id))
      .leftJoin(
        ProductTranslations,
        and(
          eq(Bookings.product_id, ProductTranslations.product_id),
          eq(ProductTranslations.locale, lang),
        ),
      )
      .leftJoin(TourDates, eq(Bookings.tour_date_id, TourDates.id))
      .leftJoin(Users, eq(Bookings.user_id, Users.id))
      .where(eq(Bookings.product_id, productId))
      .execute()

    const decryptedBookings = bookings.map((booking: any) => ({
      ...booking,
      user: {
        ...booking.user,
        email: decrypt(booking.user.email),
      },
    }))

    if (!decryptedBookings || decryptedBookings.length === 0) {
      const error: any = new Error('El producto no tiene reservas.')
      error.statusCode = 404
      console.error('404:', error.message)
      throw error
    }

    return decryptedBookings
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('500:', statusCodes[500], '-', error)
    const err: any = new Error('Error al obtener las reservas del producto.')
    err.statusCode = 500
    throw err
  }
}

export const getBookingByIdService = async (
  bookingId: string,
  locale?: string,
) => {
  if (!bookingId) {
    const error: any = new Error('El ID de la reserva es obligatorio.')
    error.statusCode = 400
    throw error
  }

  const lang = locale ?? getDefaultLocale()

  try {
    const [bookingData] = await db
      .select({
        bookingId: Bookings.id,
        tickets: Bookings.tickets,
        total: Bookings.total,
        productId: Bookings.product_id,
        userFirstName: Users.first_name,
        userLastName: Users.last_name,
        productName: ProductTranslations.name,
        tourDate: TourDates.date,
      })
      .from(Bookings)
      .leftJoin(Users, eq(Bookings.user_id, Users.id))
      .leftJoin(Products, eq(Bookings.product_id, Products.id))
      .leftJoin(
        ProductTranslations,
        and(
          eq(Bookings.product_id, ProductTranslations.product_id),
          eq(ProductTranslations.locale, lang),
        ),
      )
      .leftJoin(TourDates, eq(Bookings.tour_date_id, TourDates.id))
      .where(eq(Bookings.id, bookingId))
      .limit(1)

    if (!bookingData) return null

    return {
      nombre: `${bookingData.userFirstName} ${bookingData.userLastName}`,
      producto: bookingData.productName,
      tickets: bookingData.tickets,
      total: bookingData.total,
      fechaSeleccionada: moment(bookingData.tourDate).format('LLLL'),
    }
  } catch (error) {
    console.error('500:', 'Error al obtener la reserva extendida:', error)
    const err: any = new Error('Error al obtener la reserva extendida.')
    err.statusCode = 500
    throw err
  }
}

export const createOrAttachBookingForPayment = async (bookingData: any) => {
  const requiredFields = [
    'user_id',
    'product_id',
    'paymentMethod',
    'idTransaccion',
    'tickets',
  ]
  let tourDateId = bookingData.tour_date_id ?? bookingData.datetime
  if (Array.isArray(tourDateId)) {
    tourDateId = tourDateId[0] ?? null
  }
  if (!tourDateId) {
    const error: any = new Error('tour_date_id o datetime es obligatorio.')
    error.statusCode = 400
    throw error
  }
  const missingFields = requiredFields.filter((field) => !bookingData[field])
  if (missingFields.length > 0) {
    const error: any = new Error(
      `Los campos ${missingFields.join(', ')} son obligatorios.`,
    )
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  try {
    const [existing] = await db
      .select()
      .from(Bookings)
      .where(
        and(
          eq(Bookings.user_id, bookingData.user_id),
          eq(Bookings.product_id, bookingData.product_id),
          eq(Bookings.tour_date_id, tourDateId),
          eq(Bookings.status, BookingStatus.IN_PROCESS),
        ),
      )
      .limit(1)
      .execute()

    if (existing) {
      const [updated] = await db
        .update(Bookings)
        .set({
          idTransaccion: bookingData.idTransaccion,
          paymentMethod: bookingData.paymentMethod,
          total: String(bookingData.total),
          is_live: bookingData.is_live ?? existing.is_live,
          updated_at: new Date(),
        })
        .where(eq(Bookings.id, existing.id))
        .returning()
      return updated
    }

    return await createBookingService(bookingData)
  } catch (error: any) {
    if (!error.statusCode) {
      const err: any = new Error('Error al crear o asociar la reserva al pago.')
      err.statusCode = 500
      throw err
    }
    throw error
  }
}

// ➕ Crear nueva reserva
export const createBookingService = async (bookingData: any) => {
  const requiredFields = [
    'user_id',
    'product_id',
    'paymentMethod',
    'idTransaccion',
    'tickets',
  ]

  // Normalizar tour_date_id: el cliente puede enviar array o "datetime" como alias
  let tourDateId = bookingData.tour_date_id ?? bookingData.datetime
  if (Array.isArray(tourDateId)) {
    tourDateId = tourDateId[0] ?? null
  }
  if (!tourDateId) {
    const error: any = new Error('tour_date_id o datetime es obligatorio.')
    error.statusCode = 400
    throw error
  }

  const missingFields = requiredFields.filter((field) => !bookingData[field])
  if (missingFields.length > 0) {
    const error: any = new Error(
      `Los campos ${missingFields.join(', ')} son obligatorios.`,
    )
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  try {
    const [newBooking] = await db
      .insert(Bookings)
      .values({
        user_id: bookingData.user_id,
        product_id: bookingData.product_id,
        status: bookingData.status ?? BookingStatus.IN_PROCESS,
        is_live: bookingData.is_live ?? null,
        tickets: bookingData.tickets,
        total: String(bookingData.total),
        tour_date_id: tourDateId,
        paymentMethod: bookingData.paymentMethod,
        idTransaccion: bookingData.idTransaccion,
      })
      .returning()

    await db
      .update(TourDates)
      .set({
        people_booked: sql`${TourDates.people_booked} + ${bookingData.tickets}`,
      })
      .where(eq(TourDates.id, tourDateId))

    return newBooking
  } catch (error: any) {
    if (!error.statusCode) {
      const err: any = new Error('Error al crear la reserva.')
      err.statusCode = 500
      throw err
    }
    throw error
  }
}

// 🔄 Actualizar reserva
export const updateBookingService = async (
  bookingId: string,
  bookingData: any,
) => {
  if (!bookingId) {
    const error: any = new Error('El ID de la reserva es obligatorio.')
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  try {
    const [updatedBooking] = await db
      .update(Bookings)
      .set(bookingData)
      .where(eq(Bookings.id, bookingId))
      .returning()

    if (!updatedBooking) {
      const error: any = new Error('Reserva no encontrada para actualizar.')
      error.statusCode = 404
      console.error('404:', error.message)
      throw error
    }

    return updatedBooking
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('500:', statusCodes[500], '-', error)
    const err: any = new Error('Error al actualizar la reserva.')
    err.statusCode = 500
    throw err
  }
}

export const updateBookingStatusByTransactionId = async (
  transactionId: string,
  newStatus:
    | typeof BookingStatus.IN_PROCESS
    | typeof BookingStatus.COMPLETED
    | typeof BookingStatus.CANCELED,
) => {
  if (!transactionId) {
    const error: any = new Error('El ID de la transacción es obligatorio.')
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  try {
    const [updatedBooking] = await db
      .update(Bookings)
      .set({ status: newStatus })
      .where(eq(Bookings.idTransaccion, transactionId))
      .returning()

    if (!updatedBooking) {
      console.warn('⚠️ Transacción recibida pero no hay booking asociado.')
    }

    return updatedBooking
  } catch (error: any) {
    if (!error.statusCode) {
      const err: any = new Error('Error al actualizar el estado del booking.')
      err.statusCode = 500
      throw err
    }
    throw error
  }
}

// ❌ Eliminar una reserva
export const deleteBookingService = async (bookingId: string) => {
  if (!bookingId) {
    const error: any = new Error('El ID de la reserva es obligatorio.')
    error.statusCode = 400
    console.error('400:', error.message)
    throw error
  }

  try {
    const [deletedBooking] = await db
      .delete(Bookings)
      .where(eq(Bookings.id, bookingId))
      .returning()

    if (!deletedBooking) {
      const error: any = new Error('Reserva no encontrada para eliminar.')
      error.statusCode = 404
      console.error('404:', error.message)
      throw error
    }

    return deletedBooking
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('500:', statusCodes[500], '-', error)
    const err: any = new Error('Error al eliminar la reserva.')
    err.statusCode = 500
    throw err
  }
}
