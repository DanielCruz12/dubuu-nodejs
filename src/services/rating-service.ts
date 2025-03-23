import { db } from '../database/db'
import { Request } from 'express'
import { Ratings, Users } from '../database/schemas'
import { eq } from 'drizzle-orm'

export const getRatingsService = async (id: string) => {
  const products = await db
    .select({
      id: Ratings.id,
      user_id: Ratings.user_id,
      product_id: Ratings.product_id,
      rating: Ratings.rating,
      review: Ratings.review,
      name: Users.name,
      email: Users.email,
    })
    .from(Ratings)
    .innerJoin(Users, eq(Users.id, Ratings.user_id))
    .where(eq(Ratings.product_id, id))
  return products
}

export const getRatingByIdService = async (id: string) => {
  const product = await db.select().from(Ratings).where(eq(Ratings.id, id))
  return product
}

export const createRatingService = async (req: Request) => {
  const { product_id, user_id, rating, review } = req.body

  const newRating = {
    product_id,
    user_id,
    rating,
    review,
  }

  await db.insert(Ratings).values(newRating)

  return newRating
}

export const deleteRatingService = async (id: string) => {
  const deletedRating = await db
    .delete(Ratings)
    .where(eq(Ratings.id, id))
    .returning()
  return deletedRating
}
