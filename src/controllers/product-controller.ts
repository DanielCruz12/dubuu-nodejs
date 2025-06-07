import type { Request, Response } from 'express'
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductsByUserIdService,
  getProductsByUserIdSimplifiedService,
  getProductsService,
} from '../services/product-service'
import { statusCodes } from '../utils'
import { deleteFilesFromS3, uploadFilesToS3 } from '../utils/aws'

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
    const products = await getProductsService(req)
    res.status(200).json(products)
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
    const product = await getProductByIdService(productId)
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
    const products = await getProductsByUserIdService(userId)
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
    const products = await getProductsByUserIdSimplifiedService(userId)
    res.status(200).json(products)
  } catch (error: any) {
    const status = error.status || 500
    const message =
      statusCodes[status] || error.message || 'Error al obtener los productos.'
    console.error('Error en getProductsByUserId:', error)
    res.status(status).json({ message })
  }
}

// Crear producto (ahora siempre con archivos)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = { ...req.body }

    // Obtener nombres de tipo y categoría
    const { typeName, categoryName } = await getProductTypeAndCategory(
      productData.product_type_id,
      productData.product_category_id,
    )

    // Inicializar arrays de archivos
    productData.images = productData.images || []
    productData.banner = productData.banner || ''

    const files = req.files as {
      images?: Express.Multer.File[]
      banner?: Express.Multer.File[]
      files?: Express.Multer.File[]
      videos?: Express.Multer.File[]
    }

    if (files) {
      // Subir imágenes
      if (files['images'] && files['images'].length > 0) {
        const uploadedImages = await uploadFilesToS3(
          files['images'],
          'images',
          typeName,
          categoryName,
        )
        productData.images = uploadedImages
      }

      // Subir banner
      if (files['banner'] && files['banner'].length > 0) {
        const uploadedBanner = await uploadFilesToS3(
          [files['banner'][0]],
          'banners',
          typeName,
          categoryName,
        )
        productData.banner = uploadedBanner[0]
      }

      // Subir archivos adicionales
      if (files['files'] && files['files'].length > 0) {
        const uploadedFiles = await uploadFilesToS3(
          files['files'],
          'files',
          typeName,
          categoryName,
        )
        productData.files = uploadedFiles
      }

      // Subir videos
      if (files['videos'] && files['videos'].length > 0) {
        const uploadedVideos = await uploadFilesToS3(
          files['videos'],
          'videos',
          typeName,
          categoryName,
        )
        productData.videos = uploadedVideos
      }
    }

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
