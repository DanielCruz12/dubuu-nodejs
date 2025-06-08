import { and, eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import {
  ProductAmenities,
  ProductAmenitiesProducts,
  ProductCategories,
  Products,
  ProductTypes,
  TargetProductAudiences,
  Users,
} from '../database/schemas'

export const getBaseProductInfo = async (productId: string) => {
  const result = await db
    .select({
      id: Products.id,
      name: Products.name,
      description: Products.description,
      user_id: Products.user_id,
      price: Products.price,
      address: Products.address,
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

      product_category: {
        id: ProductCategories.id,
        name: ProductCategories.name,
      },
      product_type: {
        id: ProductTypes.id,
        name: ProductTypes.name,
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
    })
    .from(Products)
    .where(and(eq(Products.id, productId)))
    .innerJoin(Users, eq(Products.user_id, Users.id))
    .innerJoin(
      ProductCategories,
      eq(Products.product_category_id, ProductCategories.id),
    )
    .innerJoin(
      TargetProductAudiences,
      eq(Products.target_product_audience_id, TargetProductAudiences.id),
    )
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
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
      ProductCategories.id,
      TargetProductAudiences.id,
    )
    .limit(1)

  return result[0] || null
}

export const getBaseProductInfoSimplified = async (productId: string) => {
  const result = await db
    .select({
      id: Products.id,
      name: Products.name,
      product_type: {
        id: ProductTypes.id,
        name: ProductTypes.name,
      },
    })
    .from(Products)
    .where(and(eq(Products.id, productId)))

    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))

    .groupBy(Products.id, ProductTypes.id)
    .limit(1)

  return result[0] || null
}
