import { Request } from 'express'
import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { ProductAmenities } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los amenities (comodidades)
export const getProductAmenitiesService = async (_req: Request) => {
  try {
    const amenities = await db.select().from(ProductAmenities)
    return amenities
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los amenities.')
  }
}

// 🔍 Obtener un amenity por ID
export const getProductAmenityByIdService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del amenity es obligatorio.')
  }

  try {
    const [amenity] = await db
      .select()
      .from(ProductAmenities)
      .where(eq(ProductAmenities.id, id))

    if (!amenity) {
      console.error('404:', statusCodes[404])
      throw new Error('Amenity no encontrado.')
    }

    return amenity
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el amenity.')
  }
}

// ➕ Crear nuevo amenity con validación
export const createProductAmenityService = async (data: any) => {
  const name = data?.name?.trim()

  if (!name) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre del amenity es obligatorio.')
  }

  try {
    // Validar si ya existe (por nombre)
    const existing = await db
      .select()
      .from(ProductAmenities)
      .where(ilike(ProductAmenities.name, name))

    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe un amenity con el nombre "${name}".`)
    }

    const [newAmenity] = await db
      .insert(ProductAmenities)
      .values(data)
      .returning()

    return newAmenity
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el amenity.')
  }
}

// ❌ Eliminar un amenity por ID
export const deleteProductAmenityService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del amenity es obligatorio para eliminar.')
  }

  try {
    const [deleted] = await db
      .delete(ProductAmenities)
      .where(eq(ProductAmenities.id, id))
      .returning()

    if (!deleted) {
      console.error('404:', statusCodes[404])
      throw new Error('No se encontró el amenity para eliminar.')
    }

    return deleted
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el amenity.')
  }
}
