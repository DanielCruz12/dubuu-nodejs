import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { ProductTypes } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los tipos de producto
export const getProductTypesService = async () => {
  try {
    return await db.select().from(ProductTypes)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los tipos de producto.')
  }
}

// 🔍 Obtener un tipo por ID
export const getProductTypeByIdService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del tipo de producto es obligatorio.')
  }

  try {
    const [type] = await db
      .select()
      .from(ProductTypes)
      .where(eq(ProductTypes.id, id))
    if (!type) {
      console.error('404:', statusCodes[404])
      throw new Error('Tipo de producto no encontrado.')
    }
    return type
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al buscar el tipo de producto.')
  }
}

// ➕ Crear tipo
export const createProductTypeService = async (data: {
  name?: string
  description?: string
}) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()

  if (!name || !description) {
    console.error('400:', statusCodes[400])
    throw new Error('Los campos name y description son obligatorios.')
  }

  try {
    const existing = await db
      .select()
      .from(ProductTypes)
      .where(ilike(ProductTypes.name, name))

    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe un tipo con el nombre "${name}".`)
    }

    const [newType] = await db
      .insert(ProductTypes)
      .values({ name, description })
      .returning()

    return newType
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el tipo de producto.')
  }
}

// 🔄 Actualizar tipo
export const updateProductTypeService = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del tipo es obligatorio.')
  }

  const name = data?.name?.trim()
  const description = data?.description?.trim()

  if (!name || !description) {
    console.error('400:', statusCodes[400])
    throw new Error('Los campos name y description son obligatorios.')
  }

  try {
    const [updated] = await db
      .update(ProductTypes)
      .set({ name, description })
      .where(eq(ProductTypes.id, id))
      .returning()

    if (!updated) {
      console.error('404:', statusCodes[404])
      throw new Error('Tipo no encontrado para actualizar.')
    }

    return updated
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el tipo.')
  }
}

// ❌ Eliminar tipo
export const deleteProductTypeService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del tipo es obligatorio para eliminar.')
  }

  try {
    const [deleted] = await db
      .delete(ProductTypes)
      .where(eq(ProductTypes.id, id))
      .returning()

    if (!deleted) {
      console.error('404:', statusCodes[404])
      throw new Error('Tipo no encontrado para eliminar.')
    }

    return deleted
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el tipo de producto.')
  }
}
