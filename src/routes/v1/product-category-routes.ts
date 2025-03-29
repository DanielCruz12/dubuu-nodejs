import express from 'express'
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  getProductCategories,
} from '../../controllers/product-category-controller'

const router = express.Router()

router.get('/', getProductCategories)
router.get('/:id', getProductCategoryById)
router.post('/', createProductCategory)
router.delete('/:id', deleteProductCategory)

export { router as productCategoriesRoutes }
