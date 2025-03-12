import { db } from "../database/db"
import { Products } from "../database/schemas"

export const getProductsService = async () => {
  return await db.select().from(Products)
}
