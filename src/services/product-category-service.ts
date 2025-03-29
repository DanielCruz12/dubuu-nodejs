import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { ProductCategories } from '../database/schemas'
import { db } from '../database/db'

export const getProductCategoriesService = async (req: Request) => {
  return db.select().from(ProductCategories)
}

export const getProductCategoryByIdService = async (id: string) => {
  const [category] = await db
    .select()
    .from(ProductCategories)
    .where(eq(ProductCategories.id, id))
  return category
}

export const createProductCategoryService = async (data: any) => {
  const [newCategory] = await db
    .insert(ProductCategories)
    .values(data)
    .returning()
  return newCategory
}

export const deleteProductCategoryService = async (id: string) => {
  const [deleted] = await db
    .delete(ProductCategories)
    .where(eq(ProductCategories.id, id))
    .returning()
  return deleted
}
