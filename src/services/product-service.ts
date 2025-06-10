import { db } from '../database/db'
import { Request } from 'express'
import { Products, Ratings, TourDates } from '../database/schemas'
import {
  ProductAmenitiesProducts,
  ProductCategories,
  ProductTypes,
  TargetProductAudiences,
} from '../database/schemas/product-catalogs'
import { eq, and, ilike, gte, lte, desc, or, lt } from 'drizzle-orm'
import { createTourHandler } from '../handlers/create-tour'
import {
  getBaseProductInfo,
  getBaseProductInfoSimplified,
} from '../handlers/generic-get-product'
import { getTourById } from '../handlers/get-tour'
import { getRentalById } from '../handlers/get-rental'

export const getProductsService = async (req: Request) => {
  const limit = parseInt(req.query.limit as string) || 10
  const cursor = req.query.cursor as string | undefined // Fecha del último producto cargado

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
    ilike(ProductTypes.name, productTypeName),
    ...(search
      ? [
          or(
            ilike(Products.name, `%${search}%`),
            ilike(Products.description, `%${search}%`),
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
    // Si hay un cursor, añadimos la condición para obtener registros con created_at menor que el cursor
    ...(cursor ? [lt(Products.created_at, new Date(cursor))] : []),
  ]

  // Obtenemos un elemento extra para saber si hay más resultados
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
    .orderBy(
      desc(Products.created_at), // Ordenamos primero por fecha de creación descendente
      desc(Products.id), // Desempate por ID para productos con la misma fecha
    )
    .limit(limit + 1) // Pedimos un elemento extra para saber si hay más

  // Verificamos si hay más resultados
  const hasMore = products.length > limit
  // Eliminamos el elemento extra si existe
  const results = hasMore ? products.slice(0, limit) : products

  // Obtenemos la fecha de creación del último producto para usarla como cursor
  const nextCursor =
    results.length > 0
      ? results[results.length - 1].product.created_at.toISOString()
      : null

  return {
    data: results.map((p) => ({
      ...p.product,
    })),
    pagination: {
      hasMore,
      nextCursor,
      limit,
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
    const {
      name,
      description,
      price,
      address,
      country,
      is_active,
      selectedDateId,
      max_people,
    } = productData

    // Preparar objeto de actualización para el producto base
    const productUpdateData: any = {
      updated_at: new Date(),
    }

    // Validar y agregar campos del producto base
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        throw new Error('El nombre del producto no puede estar vacío.')
      }
      productUpdateData.name = name.trim()
    }

    if (description !== undefined) {
      if (!description || description.trim() === '') {
        throw new Error('La descripción del producto no puede estar vacía.')
      }
      productUpdateData.description = description.trim()
    }

    if (price !== undefined) {
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error('El precio debe ser un número válido mayor que 0.')
      }
      productUpdateData.price = parseFloat(price).toFixed(2)
    }

    if (address !== undefined) {
      if (!address || address.trim() === '') {
        throw new Error('La dirección no puede estar vacía.')
      }
      productUpdateData.address = address.trim()
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
