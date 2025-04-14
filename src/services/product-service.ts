import { db } from '../database/db'
import { Request } from 'express'
import { Products, Ratings, TourDates, Tours, Users } from '../database/schemas'
import {
  ProductAmenities,
  ProductAmenitiesProducts,
  ProductCategories,
  ProductTypes,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import { eq, sql, and, ilike, gte, lte, desc } from 'drizzle-orm'
import { createTourHandler } from '../handlers/create-tour'

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

  const [{ count: total = 0 } = {}] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(Products)
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .where(and(...whereConditions))

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
        tour: {
          duration: Tours.duration,
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
    .leftJoin(Tours, eq(Products.id, Tours.product_id))
    .groupBy(
      Products.id,
      ProductCategories.id,
      TargetProductAudiences.id,
      ProductTypes.id,
      Tours.product_id,
    )
    .orderBy(desc(Products.created_at))
    .limit(limit)
    .offset(offset)

  const totalPages = Math.ceil(total / limit)

  return {
    data: products.map((p) => ({
      ...p.product,
    })),
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
            DISTINCT jsonb_build_object(
              'id', ${ProductAmenities.id},
              'name', ${ProductAmenities.name}
            )
          ) FILTER (WHERE ${ProductAmenities.id} IS NOT NULL),
          '[]'
        )
      `.as('amenities'),
        tour: {
          departure_point: Tours.departure_point,
          tour_dates: sql`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', ${TourDates.id},
                'date', ${TourDates.date},
                'max_people', ${TourDates.max_people},
                'people_booked', ${TourDates.people_booked}
              )
            ) FILTER (WHERE ${TourDates.id} IS NOT NULL),
            '[]'
          )
        `.as('tour_dates'),
          itinerary: Tours.itinerary,
          highlight: Tours.highlight,
          included: Tours.included,
          duration: Tours.duration,
        },
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
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .leftJoin(Tours, eq(Products.id, Tours.product_id))
    .leftJoin(TourDates, eq(Tours.product_id, TourDates.tour_id))
    .leftJoin(
      ProductAmenitiesProducts,
      eq(Products.id, ProductAmenitiesProducts.productId),
    )
    .leftJoin(
      ProductAmenities,
      eq(ProductAmenitiesProducts.productAmenityId, ProductAmenities.id),
    )
    
    .groupBy(
      Users.id,
      Products.id,
      ProductTypes.id,
      Tours.product_id,
      ProductCategories.id,
      TargetProductAudiences.id,
    )
    .limit(1)

  return product[0]?.product || null
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
