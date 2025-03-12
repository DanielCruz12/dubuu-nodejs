import { Request, Response } from 'express'
import { getProductsService } from '../services/product-service'

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsService()
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
