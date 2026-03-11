import { and, eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { ProductTypes, ProductTypeTranslations } from '../database/schemas'
import { statusCodes } from '../utils'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { saveProductTypeWithTranslations } from './product-catalog-translations-service'

export const getProductTypesService = async (locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  try {
    return await db
      .select({
        id: ProductTypes.id,
        name: ProductTypeTranslations.name,
        description: ProductTypeTranslations.description,
        created_at: ProductTypes.created_at,
        updated_at: ProductTypes.updated_at,
      })
      .from(ProductTypes)
      .innerJoin(
        ProductTypeTranslations,
        and(
          eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
          eq(ProductTypeTranslations.locale, lang),
        ),
      )
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los tipos de producto.')
  }
}

export const getProductTypeByIdService = async (id: string, locale?: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del tipo de producto es obligatorio.')
  }
  const lang = locale ?? getDefaultLocale()
  try {
    const [row] = await db
      .select({
        id: ProductTypes.id,
        name: ProductTypeTranslations.name,
        description: ProductTypeTranslations.description,
        created_at: ProductTypes.created_at,
        updated_at: ProductTypes.updated_at,
      })
      .from(ProductTypes)
      .innerJoin(
        ProductTypeTranslations,
        and(
          eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
          eq(ProductTypeTranslations.locale, lang),
        ),
      )
      .where(eq(ProductTypes.id, id))
    if (!row) {
      console.error('404:', statusCodes[404])
      throw new Error('Tipo de producto no encontrado.')
    }
    return row
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al buscar el tipo de producto.')
  }
}

export const createProductTypeService = async (data: {
  name?: string
  description?: string
  locale?: string
}) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  const requestedLocale = data?.locale?.trim()?.toLowerCase()
  const enabled = getEnabledLocales()
  const locale = requestedLocale && enabled.includes(requestedLocale)
    ? requestedLocale
    : undefined

  if (!name || !description) {
    console.error('400:', statusCodes[400])
    throw new Error('Los campos name y description son obligatorios.')
  }

  const lang = locale ?? getDefaultLocale()
  try {
    const existing = await db
      .select()
      .from(ProductTypeTranslations)
      .where(
        and(
          eq(ProductTypeTranslations.locale, lang),
          ilike(ProductTypeTranslations.name, name),
        ),
      )
    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe un tipo con el nombre "${name}".`)
    }

    const [newType] = await db.insert(ProductTypes).values({}).returning()
    if (!newType) throw new Error('Error al crear el tipo.')
    await saveProductTypeWithTranslations(newType.id, { name, description }, locale)
    return await getProductTypeByIdService(newType.id, locale)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el tipo de producto.')
  }
}

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
    await saveProductTypeWithTranslations(id, { name, description })
    return await getProductTypeByIdService(id)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el tipo.')
  }
}

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
