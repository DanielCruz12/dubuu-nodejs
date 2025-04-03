import { Request, Response } from 'express'

import { statusCodes } from '../utils'
import {
  getProductCategoriesService,
  getProductCategoryByIdService,
  createProductCategoryService,
  deleteProductCategoryService,
} from '../services/product-category-service'

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getProductCategoriesService()
    res.status(200).json(categories)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getProductCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const category = await getProductCategoryByIdService(id)
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createProductCategory = async (req: Request, res: Response) => {
  try {
    const newCategory = await createProductCategoryService(req.body)
    res.status(201).json(newCategory)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
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
