import { db } from '../database/db'
import { Request } from 'express'
import { Products, Ratings } from '../database/schemas'
import {
  ProductCategories,
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
      product_category: {
        id: ProductCategories.id,
        name: ProductCategories.name,
      },
      target_audience: {
        id: TargetProductAudiences.id,
        name: TargetProductAudiences.name,
      },
      average_rating: sql<number>`COALESCE(AVG(${Ratings.rating}), 0)`.as(
        'average_rating',
      ),
      total_reviews: sql<number>`COUNT(${Ratings.id})`.as('total_reviews'),
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

      average_rating: sql<number>`COALESCE(AVG(${Ratings.rating}), 0)`.as(
        'average_rating',
      ),
      total_reviews: sql<number>`COUNT(${Ratings.id})`.as('total_reviews'),
    })
    .from(Products)
    .where(and(eq(Products.id, productId), eq(Products.is_approved, true)))
    .leftJoin(Ratings, eq(Products.id, Ratings.product_id))
    .leftJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .leftJoin(
      TargetProductAudiences,
      eq(Products.target_product_audience_id, TargetProductAudiences.id),
    )
    .groupBy(Products.id, ProductCategories.id, TargetProductAudiences.id)
    .limit(1)

  return product[0]
}

export const createProductService = async (productData: any) => {
  try {
    const newProduct = await db.insert(Products).values(productData).returning()
    return newProduct
  } catch (error) {
    console.log(error)
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
