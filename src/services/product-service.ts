import { db } from '../database/db'
import { Request } from 'express'
import { Products, Ratings, TourDates, Tours } from '../database/schemas'
import {
  ProductAmenitiesProducts,
  ProductCategories,
  ProductTypes,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import { eq, sql, and, ilike, gte, lte, desc } from 'drizzle-orm'
import { createTourHandler } from '../handlers/create-tour'
import {
  getBaseProductInfo,
  getBaseProductInfoSimplified,
} from '../handlers/generic-get-product'
import { getTourById } from '../handlers/get-tour'
import { getRentalById } from '../handlers/get-rental'

export const getProductsService = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const offset = (page - 1) * limit

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

  const whereConditions = [
    ilike(ProductTypes.name, productTypeName),
    ...(search
      ? [
          ilike(Products.name, `%${search}%`),
          ilike(Products.description, `%${search}%`),
        ]
      : []),
    ...(country ? [eq(Products.country, country)] : []),
    ...(req.query.is_approved
      ? [eq(Products.is_approved, req.query.is_approved === 'true')]
      : []),
    ...(minPrice !== undefined ? [gte(Products.price, String(minPrice))] : []),
    ...(maxPrice !== undefined ? [lte(Products.price, String(maxPrice))] : []),
  ]

  const products = await db
    .select({
      product: {
        ...Products,
        product_category: {
          id: ProductCategories.id,
          name: ProductCategories.name,
        },
        target_audience: {
          id: TargetProductAudiences.id,
          name: TargetProductAudiences.name,
        },
        product_type: {
          id: ProductTypes.id,
          name: ProductTypes.name,
        },
        average_rating: Products.average_rating,
        total_reviews: Products.total_reviews,
      },
    })
    .from(Products)
    .leftJoin(Ratings, eq(Products.id, Ratings.product_id))
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .innerJoin(
      TargetProductAudiences,
      eq(Products.target_product_audience_id, TargetProductAudiences.id),
    )
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .where(and(...whereConditions))
    .groupBy(
      Products.id,
      ProductCategories.id,
      TargetProductAudiences.id,
      ProductTypes.id,
    )
    .orderBy(desc(Products.created_at))
    .limit(limit + 1) // pedimos uno más para saber si hay más
    .offset(offset)

  const hasMore = products.length > limit
  const productsSlice = products.slice(0, limit)

  return {
    data: productsSlice.map((p) => ({
      ...p.product,
    })),
    pagination: {
      page,
      limit,
      hasMore,
    },
  }
}

export const getProductByIdService = async (productId: string) => {
  const baseProduct = await getBaseProductInfo(productId)
  if (!baseProduct) return null

  const category = baseProduct.product_type.name

  switch (category) {
    case 'tours':
      return await getTourById(productId, baseProduct)
    case 'rental':
      return await getRentalById(productId, baseProduct)
  }
}

export const getProductsByUserIdService = async (userId: string) => {
  // Paso 1: obtenemos solo los IDs de productos del usuario
  const productIds = await db
    .select({ id: Products.id })
    .from(Products)
    .where(eq(Products.user_id, userId))

  // Paso 2: usamos getBaseProductInfo y la lógica por categoría
  const enrichedProducts = await Promise.all(
    productIds.map(async ({ id }) => {
      const baseProduct = await getBaseProductInfo(id)
      if (!baseProduct) return null

      const category = baseProduct.product_type.name

      switch (category) {
        case 'tours':
          return await getTourById(id, baseProduct)
        case 'rental':
          return await getRentalById(id, baseProduct)
      }
    }),
  )

  // Filtramos nulos por si algún producto fue eliminado o no está aprobado
  return enrichedProducts.filter(Boolean)
}
export const getProductsByUserIdSimplifiedService = async (userId: string) => {
  // Paso 1: obtenemos solo los IDs de productos del usuario
  const productIds = await db
    .select({ id: Products.id })
    .from(Products)
    .where(eq(Products.user_id, userId))

  // Paso 2: usamos getBaseProductInfo y la lógica por categoría
  const enrichedProducts = await Promise.all(
    productIds.map(async ({ id }) => {
      const baseProduct = await getBaseProductInfoSimplified(id)
      if (!baseProduct) return null

      const category = baseProduct.product_type.name

      switch (category) {
        case 'tours':
          return await getTourById(id, baseProduct)
        case 'rental':
          return await getRentalById(id, baseProduct)
      }
    }),
  )

  // Filtramos nulos por si algún producto fue eliminado o no está aprobado
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
    is_active,
  } = productData

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

  const [type] = await db
    .select()
    .from(ProductTypes)
    .where(eq(ProductTypes.id, product_type_id))

  if (!type) {
    throw new Error('Tipo de producto no válido.')
  }

  try {
    const [newProduct] = await db
      .insert(Products)
      .values({
        name,
        description,
        price,
        user_id,
        address,
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

    const typeName = type.name.toLowerCase()

    switch (typeName) {
      case 'tours':
        await createTourHandler(productData, newProduct.id)
        break

      // case 'rentals':
      //   await createRentalHandler(productData, newProduct.id)
      //   break

      default:
        throw new Error(
          `No hay manejador definido para el tipo de producto: ${typeName}`,
        )
    }

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
    const { name, description, available_dates, amenities, ...rest } =
      productData

    if (!name || !description) {
      throw new Error(
        'El nombre y la descripción del producto son obligatorios.',
      )
    }

    if (
      !available_dates ||
      !Array.isArray(available_dates) ||
      available_dates.length === 0
    ) {
      throw new Error('El campo available_dates debe ser un array no vacío.')
    }

    if (!amenities || !Array.isArray(amenities)) {
      throw new Error('El campo amenities debe ser un array no vacío.')
    }

    const parsedDates = available_dates.map((date: string) => {
      const parsed = new Date(date)
      if (isNaN(parsed.getTime())) {
        throw new Error(`La fecha '${date}' no es válida.`)
      }
      return parsed
    })

    // Actualizar producto
    const [updatedProduct] = await db
      .update(Products)
      .set({
        ...rest,
        name,
        description,
        available_dates: parsedDates,
      })
      .where(eq(Products.id, productId))
      .returning()

    // Eliminar amenities actuales
    await db
      .delete(ProductAmenitiesProducts)
      .where(eq(ProductAmenitiesProducts.productId, productId))

    // Insertar nuevos amenities
    const joinRows = amenities.map((amenityId: string) => ({
      productId,
      productAmenityId: amenityId,
    }))
    await db.insert(ProductAmenitiesProducts).values(joinRows).execute()

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
