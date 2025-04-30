import { Request, Response } from 'express'
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductsByUserIdService,
  getProductsByUserIdSimplifiedService,
  getProductsService,
} from '../services/product-service'
import { statusCodes } from '../utils'

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
export const getProductsByUserIdSimplified = async (req: Request, res: Response) => {
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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await createProductService(req.body)
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

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id
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
