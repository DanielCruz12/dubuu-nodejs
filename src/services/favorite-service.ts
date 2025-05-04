import { db } from '../database/db'
import { eq, and } from 'drizzle-orm'
import { Favorites } from '../database/schemas/favorites'
import { Products } from '../database/schemas'

export const getFavoritesByUserService = async (userId: string) => {
  if (!userId) return []

  const favorites = await db
    .select({
      id: Favorites.id,
      productId: Products.id,
    })
    .from(Favorites)
    .leftJoin(Products, eq(Favorites.product_id, Products.id))
    .where(eq(Favorites.user_id, userId))
    .execute()

  return favorites
}

export const addFavoriteService = async ({
  userId,
  productId,
}: {
  userId: string
  productId: string
}) => {
  if (!userId || !productId) return null

  const [existingFavorite] = await db
    .select()
    .from(Favorites)
    .where(
      and(eq(Favorites.user_id, userId), eq(Favorites.product_id, productId)),
    )
    .execute()

  if (existingFavorite) return existingFavorite

  const [newFavorite] = await db
    .insert(Favorites)
    .values({ user_id: userId, product_id: productId })
    .returning()
    .execute()

  return newFavorite
}

export const removeFavoriteService = async ({
  userId,
  productId,
}: {
  userId: string
  productId: string
}) => {
  if (!userId || !productId) return null

  const [deletedFavorite] = await db
    .delete(Favorites)
    .where(
      and(eq(Favorites.user_id, userId), eq(Favorites.product_id, productId)),
    )
    .returning()
    .execute()

  return deletedFavorite
}
