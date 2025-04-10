import { db } from '../database/db'
import { Request } from 'express'
import { Ratings, Users } from '../database/schemas'
import { eq } from 'drizzle-orm'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los ratings de un producto
export const getRatingsService = async (productId: string) => {
  if (!productId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del producto es obligatorio.')
  }

  try {
    const ratings = await db
      .select({
        id: Ratings.id,
        user_id: Ratings.user_id,
        product_id: Ratings.product_id,
        rating: Ratings.rating,
        review: Ratings.review,
        username: Users.username,
        email: Users.email,
        created_at: Ratings.created_at,
        updated_at: Ratings.updated_at,
      })
      .from(Ratings)
      .innerJoin(Users, eq(Users.id, Ratings.user_id))
      .where(eq(Ratings.product_id, productId))

    return ratings
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las calificaciones.')
  }
}

// 🔍 Obtener un rating por ID
export const getRatingByIdService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del rating es obligatorio.')
  }

  try {
    const [rating] = await db.select().from(Ratings).where(eq(Ratings.id, id))
    return rating || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el rating.')
  }
}

// ➕ Crear un nuevo rating
export const createRatingService = async (req: Request) => {
  const { product_id, user_id, rating, review } = req.body

  if (!product_id || !user_id || rating === undefined) {
    console.error('400:', statusCodes[400])
    throw new Error('Campos requeridos: product_id, user_id y rating.')
  }

  try {
    const newRating = {
      product_id,
      user_id,
      rating: Number(rating),
      review: review?.trim() || '',
    }

    const [created] = await db.insert(Ratings).values(newRating).returning()
    return created
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el rating.')
  }
}

// ❌ Eliminar un rating por ID
export const deleteRatingService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del rating es obligatorio.')
  }

  try {
    const [deletedRating] = await db
      .delete(Ratings)
      .where(eq(Ratings.id, id))
      .returning()

    if (!deletedRating) {
      console.error('404:', statusCodes[404])
      throw new Error('Rating no encontrado para eliminar.')
    }

    return deletedRating
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el rating.')
  }
}
