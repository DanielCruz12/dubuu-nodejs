import { Request, Response } from 'express'

import { statusCodes } from '../utils'
import {
  getProductServicesService,
  getProductServiceByIdService,
  createProductServiceService,
  deleteProductServiceService,
} from '../services/product-services-service'

export const getProductServices = async (req: Request, res: Response) => {
  try {
    const productServices = await getProductServicesService(req)
    res.status(200).json(productServices)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getProductServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const productService = await getProductServiceByIdService(id)
    if (!productService) {
      return res.status(404).json({ message: 'Product Service not found' })
    }
    res.status(200).json(productService)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createProductService = async (req: Request, res: Response) => {
  try {
    const newService = await createProductServiceService(req.body)
    res.status(201).json(newService)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteProductService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await deleteProductServiceService(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Product Service not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
