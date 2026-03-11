import { Request } from 'express'
import { and, eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { ProductAmenities, ProductAmenityTranslations } from '../database/schemas'
import { statusCodes } from '../utils'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { saveProductAmenityWithTranslations } from './product-catalog-translations-service'

export const getProductAmenitiesService = async (
  _req: Request,
  locale?: string,
) => {
  const lang = locale ?? getDefaultLocale()
  try {
    return await db
      .select({
        id: ProductAmenities.id,
        name: ProductAmenityTranslations.name,
        description: ProductAmenityTranslations.description,
        category_id: ProductAmenities.category_id,
        created_at: ProductAmenities.created_at,
        updated_at: ProductAmenities.updated_at,
      })
      .from(ProductAmenities)
      .innerJoin(
        ProductAmenityTranslations,
        and(
          eq(ProductAmenities.id, ProductAmenityTranslations.amenity_id),
          eq(ProductAmenityTranslations.locale, lang),
        ),
      )
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los amenities.')
  }
}

export const getProductAmenityByIdService = async (
  id: string,
  locale?: string,
) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del amenity es obligatorio.')
  }
  const lang = locale ?? getDefaultLocale()
  try {
    const [row] = await db
      .select({
        id: ProductAmenities.id,
        name: ProductAmenityTranslations.name,
        description: ProductAmenityTranslations.description,
        category_id: ProductAmenities.category_id,
        created_at: ProductAmenities.created_at,
        updated_at: ProductAmenities.updated_at,
      })
      .from(ProductAmenities)
      .innerJoin(
        ProductAmenityTranslations,
        and(
          eq(ProductAmenities.id, ProductAmenityTranslations.amenity_id),
          eq(ProductAmenityTranslations.locale, lang),
        ),
      )
      .where(eq(ProductAmenities.id, id))
    if (!row) {
      console.error('404:', statusCodes[404])
      throw new Error('Amenity no encontrado.')
    }
    return row
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el amenity.')
  }
}

export const createProductAmenityService = async (data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim() ?? ''
  const requestedLocale = data?.locale?.trim()?.toLowerCase()
  const enabled = getEnabledLocales()
  const locale = requestedLocale && enabled.includes(requestedLocale)
    ? requestedLocale
    : undefined

  if (!name) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre del amenity es obligatorio.')
  }

  const lang = locale ?? getDefaultLocale()
  try {
    const existing = await db
      .select()
      .from(ProductAmenityTranslations)
      .where(
        and(
          eq(ProductAmenityTranslations.locale, lang),
          ilike(ProductAmenityTranslations.name, name),
        ),
      )
    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe un amenity con el nombre "${name}".`)
    }

    const [newAmenity] = await db
      .insert(ProductAmenities)
      .values({ category_id: data?.category_id })
      .returning()
    if (!newAmenity) throw new Error('Error al crear el amenity.')
    await saveProductAmenityWithTranslations(
      newAmenity.id,
      { name, description },
      locale,
    )
    return await getProductAmenityByIdService(newAmenity.id, locale)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el amenity.')
  }
}

export const updateProductAmenityService = async (id: string, data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del amenity es obligatorio para actualizar.')
  }
  if (name !== undefined || description !== undefined) {
    const [cur] = await db
      .select()
      .from(ProductAmenityTranslations)
      .where(
        and(
          eq(ProductAmenityTranslations.amenity_id, id),
          eq(ProductAmenityTranslations.locale, getDefaultLocale()),
        ),
      )
      .limit(1)
    await saveProductAmenityWithTranslations(id, {
      name: name ?? cur?.name ?? '',
      description: description ?? cur?.description ?? '',
    })
  }
  return await getProductAmenityByIdService(id)
}

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
