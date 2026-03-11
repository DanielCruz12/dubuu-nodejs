import { Request, Response } from 'express'

import { omitTimestamps, statusCodes } from '../utils'
import {
  getProductCategoriesService,
  getProductCategoryByIdService,
  createProductCategoryService,
  deleteProductCategoryService,
} from '../services/product-category-service'

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const locale = req.query.locale as string | undefined
    const categories = await getProductCategoriesService(locale)
    res.status(200).json(omitTimestamps(categories))
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getProductCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const locale = req.query.locale as string | undefined
    const category = await getProductCategoryByIdService(id, locale)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.status(200).json(omitTimestamps(category))
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createProductCategory = async (req: Request, res: Response) => {
  try {
    const newCategory = await createProductCategoryService(req.body)
    res.status(201).json(omitTimestamps(newCategory))
  } catch (error: any) {
    console.error('❌ Error en createProductCategory:', error)
    res.status(400).json({ error: error.message })
  }
}


export const deleteProductCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await deleteProductCategoryService(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
