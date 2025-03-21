import { Request, Response } from 'express'
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductsService,
} from '../services/product-service'

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsService(req)
    res.status(200).json(products)
  } catch (error: any) {
    if (error.status === 404) {
      res.status(404).json({ message: 'Not Found' })
    } else if (error.status === 401) {
      res.status(401).json({ message: 'Unauthorized' })
    } else if (error.status === 403) {
      res.status(403).json({ message: 'Forbidden' })
    } else {
      res.status(500).json({ message: 'Internal Server Error' })
    }
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id
    const product = await getProductByIdService(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await createProductService(req.body)
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id
    const result = await deleteProductService(productId)
    if (!result) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
