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
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '../utils/aws'

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

// Función para subir archivos a S3
export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
  folder: 'banners' | 'images' | 'files' | 'videos',
  typeName: string,
  categoryName: string,
) => {
  return Promise.all(
    files.map(async (file) => {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.originalname}`

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `products/${typeName}/${categoryName}/${folder}/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      }

      const command = new PutObjectCommand(uploadParams)
      await s3.send(command)

      const baseUrl = process.env.CLOUDFRONT_DOMAIN
        ? `https://${process.env.CLOUDFRONT_DOMAIN}`
        : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`

      return `${baseUrl}/products/${typeName}/${categoryName}/${folder}/${fileName}`
    }),
  )
}

// Función para eliminar archivos de S3
export const deleteFilesFromS3 = async (fileUrls: string[]) => {
  if (!fileUrls || fileUrls.length === 0) return

  return Promise.all(
    fileUrls.map(async (fileUrl) => {
      try {
        const baseUrl = process.env.CLOUDFRONT_DOMAIN
          ? `https://${process.env.CLOUDFRONT_DOMAIN}/`
          : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`

        const key = fileUrl.replace(baseUrl, '')

        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
        }

        const command = new DeleteObjectCommand(deleteParams)
        await s3.send(command)
      } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error)
      }
    }),
  )
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
