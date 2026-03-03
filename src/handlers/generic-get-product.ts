import { and, eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import {
  ProductAmenities,
  ProductAmenitiesProducts,
  ProductAmenityTranslations,
  ProductCategories,
  ProductCategoryTranslations,
  ProductTranslations,
  ProductTypeTranslations,
  Products,
  ProductTypes,
  TargetProductAudiences,
  TargetProductAudienceTranslations,
  Users,
} from '../database/schemas'
import { getDefaultLocale } from '../services/translation-service'

export const getBaseProductInfo = async (
  productId: string,
  locale?: string,
) => {
  const lang = locale ?? getDefaultLocale()
  const result = await db
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

      product_category: {
        id: ProductCategories.id,
        name: ProductCategoryTranslations.name,
      },
      product_type: {
        id: ProductTypes.id,
        name: ProductTypeTranslations.name,
      },
      target_audience: {
        id: TargetProductAudiences.id,
        name: TargetProductAudienceTranslations.name,
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
              'name', ${ProductAmenityTranslations.name}
            )
          ) FILTER (WHERE ${ProductAmenities.id} IS NOT NULL),
          '[]'
        )
      `.as('amenities'),
    })
    .from(Products)
    .innerJoin(
      ProductTranslations,
      and(
        eq(Products.id, ProductTranslations.product_id),
        eq(ProductTranslations.locale, lang),
      ),
    )
    .where(and(eq(Products.id, productId)))
    .innerJoin(Users, eq(Products.user_id, Users.id))
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
    .leftJoin(
      ProductAmenitiesProducts,
      eq(Products.id, ProductAmenitiesProducts.productId),
    )
    .leftJoin(
      ProductAmenities,
      eq(ProductAmenitiesProducts.productAmenityId, ProductAmenities.id),
    )
    .leftJoin(
      ProductAmenityTranslations,
      and(
        eq(ProductAmenities.id, ProductAmenityTranslations.amenity_id),
        eq(ProductAmenityTranslations.locale, lang),
      ),
    )
    .groupBy(
      Users.id,
      Products.id,
      ProductTranslations.product_id,
      ProductTranslations.locale,
      ProductTranslations.name,
      ProductTranslations.description,
      ProductTranslations.address,
      ProductTypes.id,
      ProductTypeTranslations.name,
      ProductCategories.id,
      ProductCategoryTranslations.name,
      TargetProductAudiences.id,
      TargetProductAudienceTranslations.name,
    )
    .limit(1)

  return result[0] || null
}

export const getBaseProductInfoSimplified = async (
  productId: string,
  locale?: string,
) => {
  const lang = locale ?? getDefaultLocale()
  const result = await db
    .select({
      id: Products.id,
      name: ProductTranslations.name,
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
    .where(and(eq(Products.id, productId)))
    .innerJoin(ProductTypes, eq(Products.product_type_id, ProductTypes.id))
    .innerJoin(
      ProductTypeTranslations,
      and(
        eq(ProductTypes.id, ProductTypeTranslations.product_type_id),
        eq(ProductTypeTranslations.locale, lang),
      ),
    )
    .groupBy(
      Products.id,
      ProductTranslations.product_id,
      ProductTranslations.locale,
      ProductTranslations.name,
      ProductTypes.id,
      ProductTypeTranslations.name,
    )
    .limit(1)

  return result[0] || null
}
