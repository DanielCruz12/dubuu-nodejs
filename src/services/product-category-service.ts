import { Request } from 'express'
import { eq, ilike } from 'drizzle-orm'
import { ProductCategories, ProductTypes } from '../database/schemas'
import { db } from '../database/db'
import { statusCodes } from '../utils'

// ✅ Obtener todas las categorías
export const getProductCategoriesService = async () => {
  try {
    return await db
      .select({
        id: ProductCategories.id,
        name: ProductCategories.name,
        description: ProductCategories.description,
        product_type: {
          id: ProductTypes.id,
          name: ProductTypes.name,
        },
      })
      .from(ProductCategories)
      .innerJoin(
        ProductTypes,
        eq(ProductCategories.product_type_id, ProductTypes.id),
      )
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener categorías.')
  }
}

// ✅ Obtener una categoría por ID
export const getProductCategoryByIdService = async (id: string) => {
  if (!id) throw new Error('El ID de la categoría es requerido.')

  try {
    const [category] = await db
      .select()
      .from(ProductCategories)
      .where(eq(ProductCategories.id, id))

    if (!category) {
      throw new Error('Categoría no encontrada.')
    }

    return category
  } catch (error) {
    console.error('Error al buscar categoría por ID:', error)
    throw error
  }
}

// ✅ Crear una nueva categoría con validación
export const createProductCategoryService = async (data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  const product_type_id = data?.product_type_id

  if (!name || !description || !product_type_id) {
    throw new Error('Campos requeridos: name, description y product_type_id.')
  }

  try {
    // Validar existencia del tipo de producto
    const [type] = await db
      .select()
      .from(ProductTypes)
      .where(eq(ProductTypes.id, product_type_id))

    if (!type) {
      throw new Error('Tipo de producto no válido.')
    }

    const [newCategory] = await db
      .insert(ProductCategories)
      .values(data)
      .returning()

    return newCategory
  } catch (error) {
    console.error('Error al crear categoría:', error)
    throw error
  }
}

// ✅ Eliminar una categoría por ID con verificación
export const deleteProductCategoryService = async (id: string) => {
  if (!id) {
    throw new Error('El ID de la categoría es obligatorio para eliminar.')
  }

  try {
    const [deleted] = await db
      .delete(ProductCategories)
      .where(eq(ProductCategories.id, id))
      .returning()

    if (!deleted) {
      throw new Error('No se encontró la categoría a eliminar.')
    }

    return deleted
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    throw error
  }
}
