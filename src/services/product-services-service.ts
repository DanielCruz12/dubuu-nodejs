import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { ProductServices } from '../database/schemas'
import { db } from '../database/db'

export const getProductServicesService = async (req: Request) => {
  // Aquí podrías parsear filtros o paginación desde req.query
  return db.select().from(ProductServices)
}

export const getProductServiceByIdService = async (id: string) => {
  const [productService] = await db
    .select()
    .from(ProductServices)
    .where(eq(ProductServices.id, id))
  return productService
}

export const createProductServiceService = async (data: any) => {
  // Ajustar el tipo de "data" según tu modelo
  const [newService] = await db.insert(ProductServices).values(data).returning()
  return newService
}

export const deleteProductServiceService = async (id: string) => {
  const [deleted] = await db
    .delete(ProductServices)
    .where(eq(ProductServices.id, id))
    .returning()
  return deleted
}
