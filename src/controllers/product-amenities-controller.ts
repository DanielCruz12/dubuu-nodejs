import { Request, Response } from 'express'

import { statusCodes } from '../utils'
import {
  getProductAmenitiesService,
  getProductAmenityByIdService,
  createProductAmenityService,
  deleteProductAmenityService,
} from '../services/product-amenities-service'

// Obtener todos los amenities
export const getProductAmenities = async (req: Request, res: Response) => {
  try {
    const productAmenities = await getProductAmenitiesService(req)
    res.status(200).json(productAmenities)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

// Obtener un amenity por ID
export const getProductAmenityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const productAmenity = await getProductAmenityByIdService(id)
    if (!productAmenity) {
      return res.status(404).json({ message: 'Product Amenity not found' })
    }
    res.status(200).json(productAmenity)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Crear un nuevo amenity
export const createProductAmenity = async (req: Request, res: Response) => {
  try {
    const newAmenity = await createProductAmenityService(req.body)
    res.status(201).json(newAmenity)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Eliminar un amenity por ID
export const deleteProductAmenity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await deleteProductAmenityService(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Product Amenity not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
