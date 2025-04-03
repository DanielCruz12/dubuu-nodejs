import { db } from '../database/db'
import { Request } from 'express'
import { Faqs, Products, Ratings, Users } from '../database/schemas'
import {
  ProductCategories,
  ProductServices,
  ProductServicesProducts,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import { eq, sql, and } from 'drizzle-orm'

export const getProductsService = async (req: Request) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const offset = (page - 1) * limit

  // Filtro de categoría, por defecto "tours"
  const category = req.query.category?.toString() || 'tours'

  // Obtener total de productos con la categoría seleccionada usando inner join
  const totalProducts = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(Products)
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .where(eq(ProductCategories.name, category))

  const total = totalProducts[0]?.count || 0
  // const totalPages = Math.ceil(total / limit)

  const products = await db
    .select({
      id: Products.id,
      name: Products.name,
      description: Products.description,
      price: Products.price,
      departure_point: Products.departure_point,
      is_approved: Products.is_approved,
      max_people: Products.max_people,
      duration: Products.duration,
      images: Products.images,
      videos: Products.videos,
      files: Products.files,
      banner: Products.banner,
      created_at: Products.created_at,
      updated_at: Products.updated_at,

      address: Products.address,
      country: Products.country,

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
    .limit(limit)
    .offset(offset)

  return products
}

export const getProductByIdService = async (productId: string) => {
  const product = await db
    .select({
      id: Products.id,
      name: Products.name,
      description: Products.description,
      price: Products.price,
      departure_point: Products.departure_point,
      is_approved: Products.is_approved,
      max_people: Products.max_people,
      duration: Products.duration,
      images: Products.images,
      videos: Products.videos,
      files: Products.files,
      banner: Products.banner,
      available_dates: Products.available_dates,
      itinerary: Products.itinerary,
      highlight: Products.highlight,
      included: Products.included,
      address: Products.address,
      country: Products.country,
      created_at: Products.created_at,
      updated_at: Products.updated_at,
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

      services: sql`
      COALESCE(
        json_agg(
          json_build_object(
            'id', ${ProductServices.id},
            'name', ${ProductServices.name}
          )
        ) FILTER (WHERE ${ProductServices.id} IS NOT NULL),
        '[]'
      )
    `.as('services'),
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

    // Join a la tabla de unión y luego a la tabla de servicios para traer sus datos:
    .leftJoin(
      ProductServicesProducts,
      eq(Products.id, ProductServicesProducts.productId),
    )
    .leftJoin(
      ProductServices,
      eq(ProductServicesProducts.productServiceId, ProductServices.id),
    )

    .groupBy(
      Products.id,
      ProductCategories.id,
      TargetProductAudiences.id,
      Users.id,
    )
    .limit(1)

  return product[0]
}

export const createProductService = async (productData: any) => {
  try {
    // Validaciones básicas
    if (!productData) {
      throw new Error('No se proporcionaron datos del producto.')
    }

    const { name, description, available_dates, services, ...rest } =
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

    // Validar que se envíe el campo "services" como un array no vacío
    if (!services || !Array.isArray(services)) {
      throw new Error(
        'El campo services es obligatorio y debe ser un array no vacío.',
      )
    }

    // Validar que cada fecha sea una cadena de fecha válida
    const parsedDates = available_dates.map((date: string) => {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`La fecha '${date}' no es válida.`)
      }
      return parsedDate
    })

    // Formatear los datos a insertar (excluyendo "services", que se manejará en la tabla de unión)
    const formattedProductData = {
      ...rest,
      name,
      description,
      available_dates: parsedDates,
    }

    // Inserta el producto en la tabla Products
    const [newProduct] = await db
      .insert(Products)
      .values(formattedProductData)
      .returning()

    // Inserta en la tabla de unión para asociar los servicios al producto
    const joinRows = services.map((serviceId: string) => ({
      productId: newProduct.id,
      productServiceId: serviceId,
    }))
    await db.insert(ProductServicesProducts).values(joinRows).execute()

    return newProduct
  } catch (error) {
    console.error('Error en createProductService:', error)
    throw error
  }
}

export const deleteProductService = async (productId: string) => {
  try {
    const deletedProduct = await db
      .delete(Products)
      .where(eq(Products.id, productId))
      .returning()
    return deletedProduct
  } catch (error) {
    console.log(error)
  }
}
