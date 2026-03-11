import express from 'express'
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategoryById,
  getProductCategories,
} from '../../controllers/product-category-controller'
import { requireRole } from '../../middlewares/role-validator'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/', getProductCategories)
router.get('/:id', getProductCategoryById)
router.post('/', requireAuth(), requireRole(['admin']), createProductCategory)
router.delete('/:id', requireAuth(), requireRole(['admin']), deleteProductCategory)

export { router as productCategoriesRoutes }
