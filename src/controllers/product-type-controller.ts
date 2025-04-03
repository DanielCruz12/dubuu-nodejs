import { Request, Response } from 'express'
import {
  getProductTypesService,
  getProductTypeByIdService,
  createProductTypeService,
  updateProductTypeService,
  deleteProductTypeService,
} from '../services/product-type-service'

export const getProductTypes = async (_req: Request, res: Response) => {
  try {
    const types = await getProductTypesService()
    res.status(200).json(types)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getProductTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const type = await getProductTypeByIdService(id)
    res.status(200).json(type)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
}

export const createProductType = async (req: Request, res: Response) => {
  try {
    const newType = await createProductTypeService(req.body)
    res.status(201).json(newType)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const updateProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updated = await updateProductTypeService(id, req.body)
    res.status(200).json(updated)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await deleteProductTypeService(id)
    res.status(200).json(deleted)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
}
