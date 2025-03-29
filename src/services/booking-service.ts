import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Users } from '../database/schemas'
import { Products } from '../database/schemas'
import { Bookings } from '../database/schemas/bookings'

export const getBookingsService = async () => {
  return await db.select().from(Bookings)
}

// Obtiene una booking por ID
export const getBookingByIdService = async (bookingId: string) => {
  const [booking] = await db
    .select()
    .from(Bookings)
    .where(eq(Bookings.id, bookingId))
    .limit(1)
    .execute()
  return booking || null
}

export const getBookingsForUserService = async (userId: string) => {
  const [user] = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1)
    .execute()

  if (!user) {
    const error = new Error('User not found')
    ;(error as any).status = 404
    throw error
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
    const error = new Error('No bookings found for this user')
    ;(error as any).status = 404
    throw error
  }
  return result
}

// Crea una nueva booking
export const createBookingService = async (bookingData: any) => {
  const [newBooking] = await db.insert(Bookings).values(bookingData).returning()
  return newBooking
}

// Actualiza una booking existente
export const updateBookingService = async (
  bookingId: string,
  bookingData: any,
) => {
  const [updatedBooking] = await db
    .update(Bookings)
    .set(bookingData)
    .where(eq(Bookings.id, bookingId))
    .returning()
  return updatedBooking
}

// Elimina una booking por ID
export const deleteBookingService = async (bookingId: string) => {
  const [deletedBooking] = await db
    .delete(Bookings)
    .where(eq(Bookings.id, bookingId))
    .returning()
  return deletedBooking
}
