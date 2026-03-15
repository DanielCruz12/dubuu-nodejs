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
import { eq, and, ilike, gte, lte, desc, or, lt } from 'drizzle-orm'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { getProductTypeByIdService } from './product-type-service'
import { createTourHandler } from '../handlers/create-tour'
import {
  getBaseProductInfo,
  getBaseProductInfoSimplified,
} from '../handlers/generic-get-product'
import { getTourById } from '../handlers/get-tour'
import { getRentalById } from '../handlers/get-rental'
import { createRentalHandler } from '../handlers/create-rental'
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

export const getProductsService = async (
  req: Request,
  locale?: string,
) => {
  const limit = parseInt(req.query.limit as string) || 10
  const cursor = req.query.cursor as string | undefined
  const defaultLocale = getDefaultLocale()
  const lang = locale ?? defaultLocale

  console.log('[getProductsService]', {
    localeReceived: locale,
    defaultLocale,
    langUsed: lang,
    hasLocale: locale != null && locale !== '',
  })

  const productTypeName =
    req.query.product_type?.toString().toLowerCase() || 'tours'
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
    ilike(ProductTypeTranslations.name, productTypeName),
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
    ...(minPrice !== undefined ? [gte(Products.price, String(minPrice))] : []),
    ...(maxPrice !== undefined ? [lte(Products.price, String(maxPrice))] : []),
    ...(is_active !== undefined ? [eq(Products.is_active, is_active)] : []),
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
      price: Products.price,
      country: Products.country,
      is_approved: Products.is_approved,
      images: Products.images,
      files: Products.files,
      videos: Products.videos,
      banner: Products.banner,
      is_active: Products.is_active,
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
        eq(TargetProductAudiences.id, TargetProductAudienceTranslations.audience_id),
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

  console.log('[getProductsService] result:', {
    langUsed: lang,
    productCount: products.length,
    productTypeName,
  })

  const hasMore = products.length > limit
  const results = hasMore ? products.slice(0, limit) : products
  const nextCursor =
    results.length > 0 ? results[results.length - 1].created_at.toISOString() : null

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
    price,
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
    is_active = true,
    locale: requestedLocale,
  } = productData
  const enabled = getEnabledLocales()
  const productLocale =
    requestedLocale?.trim()?.toLowerCase() && enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined

  // Validaciones generales
  if (
    !name ||
    !description ||
    !price ||
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
        price,
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
        is_active,
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

export const updateProductService = async (
  productId: string,
  productData: any,
) => {
  try {
    const {
      name,
      description,
      price,
      address,
      country,
      is_active,
      selectedDateId,
      max_people,
      locale: requestedLocale,
    } = productData
    const enabled = getEnabledLocales()
    const productLocale =
      requestedLocale?.trim()?.toLowerCase() && enabled.includes(requestedLocale.trim().toLowerCase())
        ? requestedLocale.trim().toLowerCase()
        : undefined

    // Preparar objeto de actualización para el producto base
    const productUpdateData: any = {
      updated_at: new Date(),
    }

    // Validar campos traducibles (se persisten en product_translations, no en products)
    if (name !== undefined && (!name || name.trim() === '')) {
      throw new Error('El nombre del producto no puede estar vacío.')
    }
    if (description !== undefined && (!description || description.trim() === '')) {
      throw new Error('La descripción del producto no puede estar vacía.')
    }

    if (price !== undefined) {
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error('El precio debe ser un número válido mayor que 0.')
      }
      productUpdateData.price = parseFloat(price).toFixed(2)
    }

    if (address !== undefined && (!address || address.trim() === '')) {
      throw new Error('La dirección no puede estar vacía.')
    }

    if (country !== undefined) {
      if (!country || country.trim() === '') {
        throw new Error('El país no puede estar vacío.')
      }
      productUpdateData.country = country.trim()
    }

    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        throw new Error('El estado activo debe ser verdadero o falso.')
      }
      productUpdateData.is_active = is_active
    }

    // Verificar que hay al menos un campo para actualizar
    const hasProductUpdates = Object.keys(productUpdateData).length > 1
    const hasTourDateUpdates = selectedDateId && max_people !== undefined

    if (!hasProductUpdates && !hasTourDateUpdates) {
      throw new Error('No se proporcionaron campos para actualizar.')
    }

    // Actualizar producto base si hay cambios
    let updatedProduct = null
    if (hasProductUpdates) {
      const [product] = await db
        .update(Products)
        .set(productUpdateData)
        .where(eq(Products.id, productId))
        .returning()

      if (!product) {
        throw new Error('Producto no encontrado o no se pudo actualizar.')
      }
      updatedProduct = product
    }

    // Actualizar fecha específica del tour si se proporciona
    if (hasTourDateUpdates) {
      // Validar max_people
      if (isNaN(parseInt(max_people)) || parseInt(max_people) <= 0) {
        throw new Error(
          'El máximo de personas debe ser un número válido mayor que 0.',
        )
      }

      const [updatedTourDate] = await db
        .update(TourDates)
        .set({
          max_people: parseInt(max_people),
        })
        .where(eq(TourDates.id, selectedDateId))
        .returning()

      if (!updatedTourDate) {
        throw new Error('Fecha del tour no encontrada o no se pudo actualizar.')
      }
    }

    // Si no se actualizó el producto, obtenerlo para retornarlo
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

    if (name !== undefined || description !== undefined || address !== undefined) {
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
