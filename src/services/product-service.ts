import { db } from '../database/db'
import { Request } from 'express'
import { Faqs, Products, Ratings, Tours, Users } from '../database/schemas'
import {
  ProductAmenities,
  ProductAmenitiesProducts,
  ProductCategories,
  ProductTypes,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import { eq, sql, and, ilike, gte, lte, desc } from 'drizzle-orm'

export const getProductsService = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const offset = (page - 1) * limit

  // Filtro de categoría, por defecto "tours"
  const category = req.query.category?.toString().toLowerCase() || 'tours'
  const search = req.query.search?.toString()
  const country = req.query.country?.toString()
  const isApproved = req.query.is_approved === 'true'
  const minPrice = req.query.min_price
    ? parseFloat(req.query.min_price as string)
    : undefined
  const maxPrice = req.query.max_price
    ? parseFloat(req.query.max_price as string)
    : undefined

  const whereConditions = [
    eq(ProductCategories.name, category),
    ...(search
      ? [
          ilike(Products.name, `%${search}%`),
          ilike(Products.description, `%${search}%`),
        ]
      : []),
    ...(country ? [eq(Products.country, country)] : []),
    ...(req.query.is_approved ? [eq(Products.is_approved, isApproved)] : []),
    ...(minPrice !== undefined
      ? [gte(Products.price, minPrice.toString())]
      : []),
    ...(maxPrice !== undefined
      ? [lte(Products.price, maxPrice.toString())]
      : []),
  ]

  const [{ count: total = 0 } = {}] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(Products)
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .where(and(...whereConditions))

  const products = await db
    .select({
      product: { ...Products },

      product_category: {
        id: ProductCategories.id,
        name: ProductCategories.name,
      },
      target_audience: {
        id: TargetProductAudiences.id,
        name: TargetProductAudiences.name,
      },
      average_rating: Products.average_rating,
      total_reviews: Products.total_reviews,
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
    .where(eq(ProductCategories.name, category))
    .groupBy(Products.id, ProductCategories.id, TargetProductAudiences.id)
    .orderBy(desc(Products.created_at))
    .limit(limit)
    .offset(offset)

  const totalPages = Math.ceil(total / limit)

  return {
    data: products,
    pagination: {
      total,
      totalPages,
      page,
      limit,
    },
  }
}

export const getProductByIdService = async (productId: string) => {
  const product = await db
    .select({
      product: { ...Products },

      product_category: {
        id: ProductCategories.id,
        name: ProductCategories.name,
      },
      target_audience: {
        id: TargetProductAudiences.id,
        name: TargetProductAudiences.name,
      },
      user: {
        id: Users.id,
        username: Users.username,
        email: Users.email,
      },
      average_rating: Products.average_rating,
      total_reviews: Products.total_reviews,

      amenities: sql`
      COALESCE(
        json_agg(
          json_build_object(
            'id', ${ProductAmenities.id},
            'name', ${ProductAmenities.name}
          )
        ) FILTER (WHERE ${ProductAmenities.id} IS NOT NULL),
        '[]'
      )
    `.as('amenities'),

      tour: {
        departure_point: Tours.departure_point,
        available_dates: Tours.available_dates,
        max_people: Tours.max_people,
        itinerary: Tours.itinerary,
        highlight: Tours.highlight,
        included: Tours.included,
        duration: Tours.duration,
      },
    })
    .from(Products)
    .where(and(eq(Products.id, productId), eq(Products.is_approved, true)))
    .innerJoin(Users, eq(Products.user_id, Users.id))
    .leftJoin(Ratings, eq(Products.id, Ratings.product_id))
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .innerJoin(
      TargetProductAudiences,
      eq(Products.target_product_audience_id, TargetProductAudiences.id),
    )
    .leftJoin(Tours, eq(Products.id, Tours.product_id))

    // Join a la tabla de unión y luego a la tabla de amenities para traer sus datos:
    .leftJoin(
      ProductAmenitiesProducts,
      eq(Products.id, ProductAmenitiesProducts.productId),
    )
    .leftJoin(
      ProductAmenities,
      eq(ProductAmenitiesProducts.productAmenityId, ProductAmenities.id),
    )

    .leftJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))

    .groupBy(
      Users.id,
      Products.id,
      ProductTypes.id,
      Tours.product_id,
      ProductCategories.id,
      TargetProductAudiences.id,
    )
    .limit(1)

  return product[0]
}

export const createProductService = async (productData: any) => {
  try {
    if (!productData)
      throw new Error('No se proporcionaron datos del producto.')

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

    const formattedProductData = {
      ...rest,
      name,
      description,
      available_dates: parsedDates,
    }

    const [newProduct] = await db
      .insert(Products)
      .values(formattedProductData)
      .returning()

    const joinRows = amenities.map((amenityId: string) => ({
      productId: newProduct.id,
      productAmenityId: amenityId,
    }))
    await db.insert(ProductAmenitiesProducts).values(joinRows).execute()

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
