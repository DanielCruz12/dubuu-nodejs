import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { ProductAmenities } from '../database/schemas'

// Obtener todos los amenities del producto
export const getProductAmenitiesService = async (req: Request) => {
  // Aquí podrías parsear filtros o paginación desde req.query si es necesario
  return db.select().from(ProductAmenities)
}

// Obtener un amenity por ID
export const getProductAmenityByIdService = async (id: string) => {
  const [productAmenity] = await db
    .select()
    .from(ProductAmenities)
    .where(eq(ProductAmenities.id, id))
  return productAmenity
}

// Crear un nuevo amenity
export const createProductAmenityService = async (data: any) => {
  // Ajustar el tipo de "data" según tu modelo
  const [newAmenity] = await db.insert(ProductAmenities).values(data).returning()
  return newAmenity
}

// Eliminar un amenity por ID
export const deleteProductAmenityService = async (id: string) => {
  const [deleted] = await db
    .delete(ProductAmenities)
    .where(eq(ProductAmenities.id, id))
    .returning()
  return deleted
}
