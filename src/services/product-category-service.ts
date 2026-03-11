import { and, eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import {
  ProductCategories,
  ProductCategoryTranslations,
  ProductTypes,
  ProductTypeTranslations,
} from '../database/schemas'
import { statusCodes } from '../utils'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { saveProductCategoryWithTranslations } from './product-catalog-translations-service'

export const getProductCategoriesService = async (locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  try {
    return await db
      .select({
        id: ProductCategories.id,
        name: ProductCategoryTranslations.name,
        description: ProductCategoryTranslations.description,
        product_type_id: ProductCategories.product_type_id,
        product_type: {
          id: ProductTypes.id,
          name: ProductTypeTranslations.name,
        },
      })
      .from(ProductCategories)
      .innerJoin(
        ProductCategoryTranslations,
        and(
          eq(ProductCategories.id, ProductCategoryTranslations.category_id),
          eq(ProductCategoryTranslations.locale, lang),
        ),
      )
      .innerJoin(
        ProductTypes,
        eq(ProductCategories.product_type_id, ProductTypes.id),
      )
      .innerJoin(
        ProductTypeTranslations,
        and(
          eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
          eq(ProductTypeTranslations.locale, lang),
        ),
      )
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener categorías.')
  }
}

export const getProductCategoryByIdService = async (
  id: string,
  locale?: string,
) => {
  if (!id) throw new Error('El ID de la categoría es requerido.')
  const lang = locale ?? getDefaultLocale()
  try {
    const [row] = await db
      .select({
        id: ProductCategories.id,
        name: ProductCategoryTranslations.name,
        description: ProductCategoryTranslations.description,
        product_type_id: ProductCategories.product_type_id,
        created_at: ProductCategories.created_at,
        updated_at: ProductCategories.updated_at,
      })
      .from(ProductCategories)
      .innerJoin(
        ProductCategoryTranslations,
        and(
          eq(ProductCategories.id, ProductCategoryTranslations.category_id),
          eq(ProductCategoryTranslations.locale, lang),
        ),
      )
      .where(eq(ProductCategories.id, id))
    if (!row) throw new Error('Categoría no encontrada.')
    return row
  } catch (error) {
    console.error('Error al buscar categoría por ID:', error)
    throw error
  }
}

export const createProductCategoryService = async (data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  const product_type_id = data?.product_type_id
  /** Idioma en que vienen name/description. Si no se envía, se detecta automáticamente. Para traducir al resto hace falta GOOGLE_TRANSLATE_API_KEY. */
  const requestedLocale = data?.locale?.trim()?.toLowerCase()
  const enabled = getEnabledLocales()
  const locale = requestedLocale && enabled.includes(requestedLocale)
    ? requestedLocale
    : undefined

  if (!name || !description || !product_type_id) {
    throw new Error('Campos requeridos: name, description y product_type_id.')
  }

  try {
    const [type] = await db
      .select()
      .from(ProductTypes)
      .where(eq(ProductTypes.id, product_type_id))
    if (!type) throw new Error('Tipo de producto no válido.')

    const [newCategory] = await db
      .insert(ProductCategories)
      .values({ product_type_id })
      .returning()
    if (!newCategory) throw new Error('Error al crear la categoría.')

    await saveProductCategoryWithTranslations(
      newCategory.id,
      { name, description },
      locale,
    )
    return await getProductCategoryByIdService(newCategory.id, locale)
  } catch (error) {
    console.error('Error al crear categoría:', error)
    throw error
  }
}

export const updateProductCategoryService = async (id: string, data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  if (!id) throw new Error('El ID de la categoría es obligatorio.')
  if (name !== undefined || description !== undefined) {
    const [cur] = await db
      .select()
      .from(ProductCategoryTranslations)
      .where(
        and(
          eq(ProductCategoryTranslations.category_id, id),
          eq(ProductCategoryTranslations.locale, getDefaultLocale()),
        ),
      )
      .limit(1)
    await saveProductCategoryWithTranslations(id, {
      name: name ?? cur?.name ?? '',
      description: description ?? cur?.description ?? '',
    })
  }
  return await getProductCategoryByIdService(id)
}

export const deleteProductCategoryService = async (id: string) => {
  if (!id) throw new Error('El ID de la categoría es obligatorio para eliminar.')
  try {
    const [deleted] = await db
      .delete(ProductCategories)
      .where(eq(ProductCategories.id, id))
      .returning()
    if (!deleted) throw new Error('No se encontró la categoría a eliminar.')
    return deleted
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    throw error
  }
}
