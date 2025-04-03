import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Users } from '../database/schemas'
import { Bookings } from '../database/schemas/bookings'
import { statusCodes } from '../utils'

// 🔍 Obtener todas las reservas
export const getBookingsService = async () => {
  try {
    const bookings = await db.select().from(Bookings)
    return bookings
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las reservas.')
  }
}

// 🔍 Obtener reserva por ID
export const getBookingByIdService = async (bookingId: string) => {
  if (!bookingId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la reserva es obligatorio.')
  }

  try {
    const [booking] = await db
      .select()
      .from(Bookings)
      .where(eq(Bookings.id, bookingId))
      .limit(1)
      .execute()

    return booking || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener la reserva.')
  }
}

// 🔍 Obtener todas las reservas de un usuario
export const getBookingsForUserService = async (userId: string) => {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio.')
  }

  try {
    const [user] = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1)
      .execute()

    if (!user) {
      console.error('404:', statusCodes[404])
      throw new Error('Usuario no encontrado.')
    }

    const result = await db
      .select({
        userId: Users.id,
        userName: Users.username,
        bookingId: Bookings.id,
        productId: Bookings.product_id,
        status: Bookings.status,
        bookingCreatedAt: Bookings.created_at,
        bookingUpdatedAt: Bookings.updated_at,
      })
      .from(Users)
      .innerJoin(Bookings, eq(Users.id, Bookings.user_id))
      .where(eq(Users.id, userId))
      .execute()

    if (result.length === 0) {
      console.error('404:', statusCodes[404])
      throw new Error('No se encontraron reservas para este usuario.')
    }

    return result
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las reservas del usuario.')
  }
}

// ➕ Crear nueva reserva
export const createBookingService = async (bookingData: any) => {
  if (!bookingData || !bookingData.user_id || !bookingData.product_id) {
    console.error('400:', statusCodes[400])
    throw new Error('Los campos user_id y product_id son obligatorios.')
  }

  try {
    const [newBooking] = await db
      .insert(Bookings)
      .values(bookingData)
      .returning()
    return newBooking
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear la reserva.')
  }
}

// 🔄 Actualizar reserva
export const updateBookingService = async (
  bookingId: string,
  bookingData: any,
) => {
  if (!bookingId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la reserva es obligatorio.')
  }

  try {
    const [updatedBooking] = await db
      .update(Bookings)
      .set(bookingData)
      .where(eq(Bookings.id, bookingId))
      .returning()

    if (!updatedBooking) {
      console.error('404:', statusCodes[404])
      throw new Error('Reserva no encontrada para actualizar.')
    }

    return updatedBooking
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar la reserva.')
  }
}

// ❌ Eliminar una reserva
export const deleteBookingService = async (bookingId: string) => {
  if (!bookingId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la reserva es obligatorio.')
  }

  try {
    const [deletedBooking] = await db
      .delete(Bookings)
      .where(eq(Bookings.id, bookingId))
      .returning()

    if (!deletedBooking) {
      console.error('404:', statusCodes[404])
      throw new Error('Reserva no encontrada para eliminar.')
    }

    return deletedBooking
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar la reserva.')
  }
}
