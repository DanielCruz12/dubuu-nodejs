import express from 'express'
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  getProductCategories,
} from '../../controllers/product-category-controller'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', getProductCategories)
router.get('/:id', getProductCategoryById)
router.post('/', requireRole(['admin']), createProductCategory)
router.delete('/:id', requireRole(['admin']), deleteProductCategory)

export { router as productCategoriesRoutes }
