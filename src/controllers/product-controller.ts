import type { Request, Response } from 'express'
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductsByUserIdService,
  getProductsByUserIdSimplifiedService,
  getProductsService,
  updateProductService,
} from '../services/product-service'
import { omitTimestamps, statusCodes } from '../utils'
import { deleteFilesFromS3, uploadFilesToS3 } from '../utils/aws'
import { db } from '../database/db'
import { TourDates } from '../database/schemas'

type TourDateRow = InferSelectModel<typeof TourDates>
import { and, eq, type InferSelectModel } from 'drizzle-orm'

// Función para obtener nombres de tipo y categoría
const getProductTypeAndCategory = async (
  typeId: string,
  categoryId: string,
) => {
  // Implementa estas consultas según tu base de datos
  return {
    typeName: typeId, // Reemplazar con consulta real
    categoryName: categoryId, // Reemplazar con consulta real
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const locale = req.query.locale as string | undefined
    const products = await getProductsService(req, locale)
    const sanitized = {
      ...products,
      data: omitTimestamps(
        (products.data as any[]).map((p) => {
          const {
            user_id,
            target_product_audience_id,
            product_category_id,
            product_type_id,
            ...rest
          } = p ?? {}
          return rest
        }),
      ),
    }
    res.status(200).json(sanitized)
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al obtener los productos.'
    console.error('Error en getProducts:', error)
    res.status(status).json({ message })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id
    const locale = req.query.locale as string | undefined
    const product = await getProductByIdService(productId, locale)
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }
    res.status(200).json(product)
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al obtener el producto.'
    console.error('Error en getProductById:', error)
    res.status(status).json({ message })
  }
}

export const getProductsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const locale = req.query.locale as string | undefined
    const products = await getProductsByUserIdService(userId, locale)
    res.status(200).json(products)
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al obtener los productos.'
    console.error('Error en getProductsByUserId:', error)
    res.status(status).json({ message })
  }
}

export const getProductsByUserIdSimplified = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.params.id
    const locale = req.query.locale as string | undefined
    const products = await getProductsByUserIdSimplifiedService(userId, locale)
    res.status(200).json(products)
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al obtener los productos.'
    console.error('Error en getProductsByUserId:', error)
    res.status(status).json({ message })
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = { ...req.body }

    // ... resto del código del controlador

    // Obtener nombres de tipo y categoría
    const { typeName, categoryName } = await getProductTypeAndCategory(
      productData.product_type_id,
      productData.product_category_id,
    )

    // Inicializar arrays de archivos
    productData.images = productData.images || []
    productData.banner = productData.banner || ''

    const files = req.files as {
      images?: Express.Multer.File[] | Express.Multer.File
      banner?: Express.Multer.File[] | Express.Multer.File
      files?: Express.Multer.File[] | Express.Multer.File
      videos?: Express.Multer.File[] | Express.Multer.File
    }

    // Normalizar a array: Multer a veces devuelve un solo File en lugar de File[] cuando hay 1 archivo
    const toFileArray = (
      field: Express.Multer.File[] | Express.Multer.File | undefined,
    ): Express.Multer.File[] =>
      !field ? [] : Array.isArray(field) ? field : [field]

    const imageFiles = toFileArray(files?.images)
    const bannerFiles = toFileArray(files?.banner)
    const extraFiles = toFileArray(files?.files)
    const videoFiles = toFileArray(files?.videos)

    if (
      imageFiles.length > 0 ||
      bannerFiles.length > 0 ||
      extraFiles.length > 0 ||
      videoFiles.length > 0
    ) {
      // Depuración: ver cuántos archivos llegan (quitar o reducir en producción si molesta)
      console.log(
        '[createProduct] Archivos recibidos:',
        'images=',
        imageFiles.length,
        'banner=',
        bannerFiles.length,
        'files=',
        extraFiles.length,
        'videos=',
        videoFiles.length,
      )

      // Subir imágenes (todas las que lleguen con el campo "images")
      if (imageFiles.length > 0) {
        const uploadedImages = await uploadFilesToS3(
          imageFiles,
          'images',
          typeName,
          categoryName,
        )
        productData.images = uploadedImages
      }

      // Subir banner
      if (bannerFiles.length > 0) {
        const uploadedBanner = await uploadFilesToS3(
          [bannerFiles[0]],
          'banners',
          typeName,
          categoryName,
        )
        productData.banner = uploadedBanner[0]
      }

      // Subir archivos adicionales
      if (extraFiles.length > 0) {
        const uploadedFiles = await uploadFilesToS3(
          extraFiles,
          'files',
          typeName,
          categoryName,
        )
        productData.files = uploadedFiles
      }

      // Subir videos
      if (videoFiles.length > 0) {
        const uploadedVideos = await uploadFilesToS3(
          videoFiles,
          'videos',
          typeName,
          categoryName,
        )
        productData.videos = uploadedVideos
      }
    }

    console.log('=== DEBUG: productData antes de enviar al service ===')
    console.log(JSON.stringify(productData, null, 2))

    const product = await createProductService(productData)
    res.status(201).json(product)
  } catch (error: any) {
    const status = error.status || 400
    const message =
      error.message ||
      'Ocurrió un error al crear el producto. Verifica los datos ingresados.'
    console.error('Error en createProduct:', error)
    res.status(status).json({ message })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id
    const updateData = { ...req.body } as Record<string, unknown>
    const { selectedDateId, update_all_tour_dates } = updateData

    // Verificar que el producto existe
    const existingProduct = await getProductByIdService(productId)
    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    // Verificar que el usuario está en el body
    const userId = req.body.user_id
    if (!userId) {
      return res
        .status(400)
        .json({ message: 'El ID del usuario es requerido.' })
    }

    // Verificar que el usuario es el propietario del producto
    if ((existingProduct as { user_id?: string }).user_id !== userId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para actualizar este producto.' })
    }

    const wantsDateFields =
      updateData.price !== undefined ||
      updateData.max_people !== undefined ||
      updateData.status !== undefined

    if (wantsDateFields && update_all_tour_dates && selectedDateId) {
      return res.status(400).json({
        message:
          'No combines selectedDateId con update_all_tour_dates; usa solo uno.',
      })
    }

    if (wantsDateFields && !update_all_tour_dates && !selectedDateId) {
      return res.status(400).json({
        message:
          'Para precio, max_people o status de fechas, envía selectedDateId o update_all_tour_dates: true.',
      })
    }

    if (selectedDateId) {
      const [tourDate] = await db
        .select()
        .from(TourDates)
        .where(eq(TourDates.id, selectedDateId as string))

      if (!tourDate) {
        return res
          .status(404)
          .json({ message: 'Fecha del tour no encontrada.' })
      }

      if (tourDate.tour_id !== productId) {
        return res
          .status(400)
          .json({ message: 'La fecha seleccionada no pertenece a este tour.' })
      }

      if (updateData.max_people !== undefined) {
        const maxPeople = parseInt(String(updateData.max_people), 10)
        if (maxPeople < tourDate.people_booked) {
          return res.status(400).json({
            message: `El máximo de personas no puede ser menor que las reservas actuales (${tourDate.people_booked}).`,
          })
        }
      }
    }

    if (update_all_tour_dates && updateData.max_people !== undefined) {
      const allDates = await db
        .select()
        .from(TourDates)
        .where(eq(TourDates.tour_id, productId))
      const maxPeople = parseInt(String(updateData.max_people), 10)
      for (const d of allDates) {
        if (maxPeople < d.people_booked) {
          return res.status(400).json({
            message: `El máximo de personas no puede ser menor que las reservas en la fecha ${d.date.toISOString()} (${d.people_booked} reservas).`,
          })
        }
      }
    }

    const updatedProduct = await updateProductService(productId, updateData)

    let updatedTourDates: TourDateRow[] | null = null
    if (wantsDateFields && update_all_tour_dates) {
      updatedTourDates = await db
        .select()
        .from(TourDates)
        .where(eq(TourDates.tour_id, productId))
    } else if (wantsDateFields && selectedDateId) {
      const [one] = await db
        .select()
        .from(TourDates)
        .where(
          and(
            eq(TourDates.id, selectedDateId as string),
            eq(TourDates.tour_id, productId),
          ),
        )
      updatedTourDates = one ? [one] : null
    }

    const response = {
      product: updatedProduct,
      ...(updatedTourDates
        ? { tourDates: updatedTourDates }
        : {}),
    }

    res.status(200).json(response)
  } catch (error: any) {
    const status = error.status || 400
    const message =
      error.message ||
      'Ocurrió un error al actualizar el producto. Verifica los datos ingresados.'
    console.error('Error en updateProduct:', error)
    res.status(status).json({ message })
  }
}

// Eliminar producto (ahora siempre con archivos)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id

    // Obtener el producto para acceder a sus archivos
    const product: any = await getProductByIdService(productId)
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    // Recopilar todas las URLs de archivos para eliminar
    const filesToDelete: string[] = []

    if (product.images && Array.isArray(product.images)) {
      filesToDelete.push(...product.images)
    }

    if (product.banner) {
      filesToDelete.push(product.banner)
    }

    if (product.files && Array.isArray(product.files)) {
      filesToDelete.push(...product.files)
    }

    if (product.videos && Array.isArray(product.videos)) {
      filesToDelete.push(...product.videos)
    }

    // Eliminar archivos de S3
    if (filesToDelete.length > 0) {
      await deleteFilesFromS3(filesToDelete)
    }

    // Eliminar producto de la base de datos
    const result = await deleteProductService(productId)
    if (!result) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    res.status(204).send()
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al eliminar el producto.'
    console.error('Error en deleteProduct:', error)
    res.status(status).json({ message })
  }
}
