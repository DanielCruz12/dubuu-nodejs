import { db } from '../database/db'
import { Request } from 'express'
import {
  ProductTranslations,
  Products,
  Ratings,
  TourDates,
} from '../database/schemas'
import {
  ProductAmenitiesProducts,
  ProductCategories,
  ProductTypes,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import {
  ProductCategoryTranslations,
  ProductTypeTranslations,
  TargetProductAudienceTranslations,
} from '../database/schemas'
import { eq, and, ilike, gte, lte, desc, or, lt, sql } from 'drizzle-orm'
import { TourDateStatus, type TourDateStatusType } from '../constants/enums'
import { getDefaultLocale, getEnabledLocales } from './translation-service'
import { getProductTypeByIdService } from './product-type-service'
import { createTourHandler } from '../handlers/create-tour'
import {
  getBaseProductInfo,
  getBaseProductInfoSimplified,
} from '../handlers/generic-get-product'
import { getTourById } from '../handlers/get-tour'
import { getRentalById } from '../handlers/get-rental'
import { createRentalHandler } from '../handlers/create-rental'
import {
  hasTourPayloadFields,
  updateTourHandler,
} from '../handlers/update-tour'
import { saveProductWithTranslations } from './product-translations-service'

const normalizeProductTypeName = (name: string) => {
  const normalized = name.trim().toLowerCase()

  if (['tours', 'tour', 'viajes', 'viaje'].includes(normalized)) {
    return 'tour'
  }

  if (['rental', 'rentals', 'alquiler', 'alquileres'].includes(normalized)) {
    return 'rental'
  }

  return normalized
}

/** Nombres posibles del tipo por idioma (en DB puede estar "tours" en en, "viajes" en es). */
const PRODUCT_TYPE_NAME_ALIASES: Record<string, string[]> = {
  tour: ['tours', 'tour', 'viajes', 'viaje'],
  rental: ['rental', 'rentals', 'alquiler', 'alquileres'],
}

export const getProductsService = async (req: Request, locale?: string) => {
  const limit = parseInt(req.query.limit as string) || 10
  const cursor = req.query.cursor as string | undefined
  const defaultLocale = getDefaultLocale()
  const lang = locale ?? defaultLocale

  const productTypeParam =
    req.query.product_type?.toString().toLowerCase() || 'tours'
  const productTypeKey = normalizeProductTypeName(productTypeParam)
  const typeNameAliases = PRODUCT_TYPE_NAME_ALIASES[productTypeKey] ?? [
    productTypeParam,
  ]
  const search = req.query.search?.toString()
  const country = req.query.country?.toString()
  const minPrice = req.query.min_price
    ? parseFloat(req.query.min_price as string)
    : undefined
  const maxPrice = req.query.max_price
    ? parseFloat(req.query.max_price as string)
    : undefined
  const is_active = req.query.is_active
    ? req.query.is_active === 'true'
    : undefined
  const minRating = req.query.min_rating
    ? parseFloat(req.query.min_rating as string)
    : undefined

  const whereConditions = [
    or(
      ...typeNameAliases.map((alias) =>
        ilike(ProductTypeTranslations.name, alias),
      ),
    ),
    ...(search
      ? [
          or(
            ilike(ProductTranslations.name, `%${search}%`),
            ilike(ProductTranslations.description, `%${search}%`),
          ),
        ]
      : []),
    ...(country ? [eq(Products.country, country)] : []),
    ...(req.query.is_approved
      ? [eq(Products.is_approved, req.query.is_approved === 'true')]
      : []),
    ...(minPrice !== undefined
      ? [
          sql`COALESCE(
            (SELECT MIN(td.price::numeric) FROM tour_dates td WHERE td.tour_id = ${Products.id}),
            (SELECT r.price_per_day::numeric FROM rentals r WHERE r.product_id = ${Products.id} LIMIT 1),
            0
          ) >= ${String(minPrice)}`,
        ]
      : []),
    ...(maxPrice !== undefined
      ? [
          sql`COALESCE(
            (SELECT MIN(td.price::numeric) FROM tour_dates td WHERE td.tour_id = ${Products.id}),
            (SELECT r.price_per_day::numeric FROM rentals r WHERE r.product_id = ${Products.id} LIMIT 1),
            0
          ) <= ${String(maxPrice)}`,
        ]
      : []),
    ...(is_active === true
      ? [
          sql`(
            EXISTS (SELECT 1 FROM tour_dates td WHERE td.tour_id = ${Products.id} AND td.status = ${TourDateStatus.ACTIVE})
            OR EXISTS (SELECT 1 FROM rentals r WHERE r.product_id = ${Products.id} AND coalesce(r.is_available, false) = true)
          )`,
        ]
      : []),
    ...(is_active === false
      ? [
          sql`(
            (EXISTS (SELECT 1 FROM tours t WHERE t.product_id = ${Products.id}) AND NOT EXISTS (SELECT 1 FROM tour_dates td WHERE td.tour_id = ${Products.id} AND td.status = ${TourDateStatus.ACTIVE}))
            OR
            (EXISTS (SELECT 1 FROM rentals r WHERE r.product_id = ${Products.id} AND coalesce(r.is_available, false) = false)
              AND NOT EXISTS (SELECT 1 FROM tours t2 WHERE t2.product_id = ${Products.id}))
          )`,
        ]
      : []),
    ...(minRating !== undefined
      ? [gte(Products.average_rating, String(minRating))]
      : []),
    ...(cursor ? [lt(Products.created_at, new Date(cursor))] : []),
  ]

  const products = await db
    .select({
      id: Products.id,
      name: ProductTranslations.name,
      description: ProductTranslations.description,
      address: ProductTranslations.address,
      user_id: Products.user_id,
      price: sql`COALESCE(
        (SELECT MIN(td.price::text) FROM tour_dates td WHERE td.tour_id = ${Products.id}),
        (SELECT r.price_per_day::text FROM rentals r WHERE r.product_id = ${Products.id} LIMIT 1)
      )`.as('price'),
      country: Products.country,
      is_approved: Products.is_approved,
      images: Products.images,
      files: Products.files,
      videos: Products.videos,
      banner: Products.banner,
      is_active: sql`(
        EXISTS (SELECT 1 FROM tour_dates td WHERE td.tour_id = ${Products.id} AND td.status = ${TourDateStatus.ACTIVE})
        OR EXISTS (SELECT 1 FROM rentals r WHERE r.product_id = ${Products.id} AND coalesce(r.is_available, false) = true)
      )`.as('is_active'),
      average_rating: Products.average_rating,
      total_reviews: Products.total_reviews,
      created_at: Products.created_at,
      updated_at: Products.updated_at,
      product_category_id: Products.product_category_id,
      target_product_audience_id: Products.target_product_audience_id,
      product_type_id: Products.product_type_id,
      product_category: {
        id: ProductCategories.id,
        name: ProductCategoryTranslations.name,
      },
      target_audience: {
        id: TargetProductAudiences.id,
        name: TargetProductAudienceTranslations.name,
      },
      product_type: {
        id: ProductTypes.id,
        name: ProductTypeTranslations.name,
      },
    })
    .from(Products)
    .innerJoin(
      ProductTranslations,
      and(
        eq(Products.id, ProductTranslations.product_id),
        eq(ProductTranslations.locale, lang),
      ),
    )
    .leftJoin(Ratings, eq(Products.id, Ratings.product_id))
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .innerJoin(
      ProductCategoryTranslations,
      and(
        eq(ProductCategories.id, ProductCategoryTranslations.category_id),
        eq(ProductCategoryTranslations.locale, lang),
      ),
    )
    .innerJoin(
      TargetProductAudiences,
      eq(Products.target_product_audience_id, TargetProductAudiences.id),
    )
    .innerJoin(
      TargetProductAudienceTranslations,
      and(
        eq(
          TargetProductAudiences.id,
          TargetProductAudienceTranslations.audience_id,
        ),
        eq(TargetProductAudienceTranslations.locale, lang),
      ),
    )
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .innerJoin(
      ProductTypeTranslations,
      and(
        eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
        eq(ProductTypeTranslations.locale, lang),
      ),
    )
    .where(and(...whereConditions))
    .orderBy(desc(Products.created_at), desc(Products.id))
    .limit(limit + 1)

  const hasMore = products.length > limit
  const results = hasMore ? products.slice(0, limit) : products
  const nextCursor =
    results.length > 0
      ? results[results.length - 1].created_at.toISOString()
      : null

  return {
    data: results,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
  }
}
export const getProductByIdService = async (
  productId: string,
  locale?: string,
) => {
  const baseProduct = await getBaseProductInfo(productId, locale)
  if (!baseProduct) return null

  const category = normalizeProductTypeName(baseProduct.product_type.name)

  switch (category) {
    case 'tour':
      return await getTourById(productId, baseProduct, locale)
    case 'rental':
      return await getRentalById(productId, baseProduct)
  }
}

export const getProductsByUserIdService = async (
  userId: string,
  locale?: string,
) => {
  const productIds = await db
    .select({ id: Products.id })
    .from(Products)
    .where(eq(Products.user_id, userId))

  const lang = locale ?? getDefaultLocale()
  const enrichedProducts = await Promise.all(
    productIds.map(async ({ id }) => {
      const baseProduct = await getBaseProductInfo(id, lang)
      if (!baseProduct) return null

      const category = normalizeProductTypeName(baseProduct.product_type.name)

      switch (category) {
        case 'tour':
          return await getTourById(id, baseProduct, lang)
        case 'rental':
          return await getRentalById(id, baseProduct)
      }
    }),
  )

  return enrichedProducts.filter(Boolean)
}

export const getProductsByUserIdSimplifiedService = async (
  userId: string,
  locale?: string,
) => {
  const productIds = await db
    .select({ id: Products.id })
    .from(Products)
    .where(eq(Products.user_id, userId))

  const lang = locale ?? getDefaultLocale()
  const enrichedProducts = await Promise.all(
    productIds.map(async ({ id }) => {
      const baseProduct = await getBaseProductInfoSimplified(id, lang)
      if (!baseProduct) return null

      const category = normalizeProductTypeName(baseProduct.product_type.name)

      switch (category) {
        case 'tour':
          return await getTourById(id, baseProduct, lang)
        case 'rental':
          return await getRentalById(id, baseProduct)
      }
    }),
  )

  return enrichedProducts.filter(Boolean)
}

export const createProductService = async (productData: any) => {
  const {
    name,
    description,
    user_id,
    address,
    country,
    product_category_id,
    target_product_audience_id,
    product_type_id,
    images = [],
    files = [],
    videos = [],
    banner = '',
    is_approved = false,
    locale: requestedLocale,
  } = productData
  const enabled = getEnabledLocales()
  const productLocale =
    requestedLocale?.trim()?.toLowerCase() &&
    enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined

  // Validaciones generales
  if (
    !name ||
    !description ||
    !user_id ||
    !product_category_id ||
    !target_product_audience_id ||
    !product_type_id ||
    !country
  ) {
    throw new Error('Faltan campos obligatorios del producto.')
  }

  const type = await getProductTypeByIdService(product_type_id)
  if (!type) {
    throw new Error('Tipo de producto no válido.')
  }

  try {
    const [newProduct] = await db
      .insert(Products)
      .values({
        user_id,
        country,
        product_category_id,
        target_product_audience_id,
        product_type_id,
        images,
        files,
        videos,
        banner,
        is_approved,
      })
      .returning()

    const typeName = normalizeProductTypeName((type as { name: string }).name)

    switch (typeName) {
      case 'tour':
        await createTourHandler(productData, newProduct.id)
        break

      case 'rental':
        await createRentalHandler(productData, newProduct.id)
        break

      default:
        throw new Error(
          `No hay manejador definido para el tipo de producto: ${typeName}`,
        )
    }

    await saveProductWithTranslations(
      newProduct.id,
      {
        name,
        description,
        address: address ?? '',
      },
      productLocale,
    )

    return newProduct
  } catch (error) {
    console.error('Error en createProductService:', error)
    throw error
  }
}

function parseTourDateStatusInput(value: unknown): TourDateStatusType {
  if (value === undefined || value === null) {
    throw new Error('status es obligatorio cuando se envía.')
  }
  if (typeof value !== 'string') {
    throw new Error('status debe ser una cadena (active, cancelled, completed).')
  }
  const v = value.trim().toLowerCase()
  if (
    v !== TourDateStatus.ACTIVE &&
    v !== TourDateStatus.CANCELLED &&
    v !== TourDateStatus.COMPLETED
  ) {
    throw new Error('status debe ser active, cancelled o completed.')
  }
  return v as TourDateStatusType
}

async function getProductTypeKeyForProduct(productId: string): Promise<string> {
  const [row] = await db
    .select({ name: ProductTypeTranslations.name })
    .from(Products)
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .innerJoin(
      ProductTypeTranslations,
      and(
        eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
        eq(ProductTypeTranslations.locale, getDefaultLocale()),
      ),
    )
    .where(eq(Products.id, productId))
    .limit(1)
  if (!row) {
    throw new Error('Producto no encontrado.')
  }
  return normalizeProductTypeName(row.name)
}

export const updateProductService = async (
  productId: string,
  productData: Record<string, unknown>,
) => {
  try {
    const {
      name,
      description,
      address,
      country,
      selectedDateId,
      update_all_tour_dates,
      price,
      max_people,
      status,
      locale: requestedLocale,
      product_type_id,
      product_category_id,
      target_product_audience_id,
      images,
      files,
      videos,
      banner,
    } = productData
    const enabled = getEnabledLocales()
    const localeStr =
      typeof requestedLocale === 'string' ? requestedLocale.trim().toLowerCase() : ''
    const productLocale =
      localeStr && enabled.includes(localeStr) ? localeStr : undefined

    if (name !== undefined && (!name || String(name).trim() === '')) {
      throw new Error('El nombre del producto no puede estar vacío.')
    }
    if (
      description !== undefined &&
      (!description || String(description).trim() === '')
    ) {
      throw new Error('La descripción del producto no puede estar vacía.')
    }

    if (address !== undefined && (!address || String(address).trim() === '')) {
      throw new Error('La dirección no puede estar vacía.')
    }

    if (country !== undefined) {
      if (!country || String(country).trim() === '') {
        throw new Error('El país no puede estar vacío.')
      }
    }

    const hasTranslationUpdates =
      name !== undefined ||
      description !== undefined ||
      address !== undefined

    const availableDatesProvided =
      Array.isArray(productData.available_dates) ||
      typeof productData.available_dates === 'string'

    const wantsTourDatePatchLegacy =
      !availableDatesProvided &&
      (price !== undefined ||
        max_people !== undefined ||
        status !== undefined)

    const productTypeKey = await getProductTypeKeyForProduct(productId)
    const shouldRunTourHandler =
      productTypeKey === 'tour' && hasTourPayloadFields(productData)

    const updateAll = update_all_tour_dates === true
    const hasTourDateUpdates =
      wantsTourDatePatchLegacy &&
      (updateAll || typeof selectedDateId === 'string')

    if (wantsTourDatePatchLegacy && !hasTourDateUpdates) {
      throw new Error(
        'Para actualizar precio, cupos o estado de fechas, envía selectedDateId o update_all_tour_dates: true.',
      )
    }

    if (updateAll && selectedDateId) {
      throw new Error(
        'No uses selectedDateId junto con update_all_tour_dates; elige uno.',
      )
    }

    const tourDatePatch: {
      price?: string
      max_people?: number
      status?: TourDateStatusType
    } = {}

    if (price !== undefined) {
      const p =
        typeof price === 'number' ? price : parseFloat(String(price))
      if (isNaN(p) || p <= 0) {
        throw new Error('El precio debe ser un número válido mayor que 0.')
      }
      tourDatePatch.price = p.toFixed(2)
    }

    if (max_people !== undefined) {
      const mp = parseInt(String(max_people), 10)
      if (isNaN(mp) || mp <= 0) {
        throw new Error(
          'El máximo de personas debe ser un número válido mayor que 0.',
        )
      }
      tourDatePatch.max_people = mp
    }

    if (status !== undefined) {
      tourDatePatch.status = parseTourDateStatusInput(status)
    }

    const hasProductUpdates =
      country !== undefined ||
      hasTranslationUpdates ||
      product_type_id !== undefined ||
      product_category_id !== undefined ||
      target_product_audience_id !== undefined ||
      images !== undefined ||
      files !== undefined ||
      videos !== undefined ||
      banner !== undefined

    if (
      !hasProductUpdates &&
      !hasTourDateUpdates &&
      !shouldRunTourHandler
    ) {
      throw new Error('No se proporcionaron campos para actualizar.')
    }

    if (shouldRunTourHandler) {
      await updateTourHandler(productId, productData)
    }

    let updatedProduct = null
    if (hasProductUpdates) {
      const [product] = await db
        .update(Products)
        .set({
          ...(country !== undefined
            ? { country: String(country).trim() }
            : {}),
          ...(product_type_id !== undefined
            ? { product_type_id: product_type_id as string }
            : {}),
          ...(product_category_id !== undefined
            ? { product_category_id: product_category_id as string }
            : {}),
          ...(target_product_audience_id !== undefined
            ? {
                target_product_audience_id:
                  target_product_audience_id as string,
              }
            : {}),
          ...(images !== undefined ? { images: images as string[] } : {}),
          ...(files !== undefined ? { files: files as string[] } : {}),
          ...(videos !== undefined ? { videos: videos as string[] } : {}),
          ...(banner !== undefined ? { banner: banner as string | null } : {}),
          updated_at: new Date(),
        })
        .where(eq(Products.id, productId))
        .returning()

      if (!product) {
        throw new Error('Producto no encontrado o no se pudo actualizar.')
      }
      updatedProduct = product
    }

    if (hasTourDateUpdates && Object.keys(tourDatePatch).length > 0) {
      const [sample] = await db
        .select({ id: TourDates.id })
        .from(TourDates)
        .where(eq(TourDates.tour_id, productId))
        .limit(1)

      if (!sample) {
        throw new Error('Este producto no tiene fechas de tour para actualizar.')
      }

      if (updateAll) {
        await db
          .update(TourDates)
          .set(tourDatePatch)
          .where(eq(TourDates.tour_id, productId))
      } else {
        const [updatedTourDate] = await db
          .update(TourDates)
          .set(tourDatePatch)
          .where(
            and(
              eq(TourDates.id, selectedDateId as string),
              eq(TourDates.tour_id, productId),
            ),
          )
          .returning()

        if (!updatedTourDate) {
          throw new Error('Fecha del tour no encontrada o no pertenece al producto.')
        }
      }
    }

    if (!updatedProduct) {
      const [product] = await db
        .select()
        .from(Products)
        .where(eq(Products.id, productId))

      if (!product) {
        throw new Error('Producto no encontrado.')
      }
      updatedProduct = product
    }

    if (
      name !== undefined ||
      description !== undefined ||
      address !== undefined
    ) {
      const defaultLocale = getDefaultLocale()
      const needFallback =
        name === undefined || description === undefined || address === undefined
      const [currentTr] = needFallback
        ? await db
            .select({
              name: ProductTranslations.name,
              description: ProductTranslations.description,
              address: ProductTranslations.address,
            })
            .from(ProductTranslations)
            .where(
              and(
                eq(ProductTranslations.product_id, productId),
                eq(ProductTranslations.locale, defaultLocale),
              ),
            )
            .limit(1)
        : []
      const fields = {
        name: (name ?? currentTr?.name ?? '') as string,
        description: (description ?? currentTr?.description ?? '') as string,
        address: (address ?? currentTr?.address ?? '') as string,
      }
      await saveProductWithTranslations(productId, fields, productLocale)
    }

    return updatedProduct
  } catch (error) {
    console.error('Error en updateProductService:', error)
    throw error
  }
}

export const deleteProductService = async (productId: string) => {
  try {
    await db
      .delete(ProductAmenitiesProducts)
      .where(eq(ProductAmenitiesProducts.productId, productId))

    const [deletedProduct] = await db
      .delete(Products)
      .where(eq(Products.id, productId))
      .returning()

    return deletedProduct
  } catch (error) {
    console.error('Error en deleteProductService:', error)
    throw error
  }
}
