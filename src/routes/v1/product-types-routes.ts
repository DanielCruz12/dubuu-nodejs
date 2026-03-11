import express from 'express'
import {
  getProductTypes,
  getProductTypeById,
  createProductType,
  updateProductType,
  deleteProductType,
} from '../../controllers/product-type-controller'
import { requireRole } from '../../middlewares/role-validator'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/', getProductTypes)
router.get('/:id', getProductTypeById)
router.post('/', requireAuth(), requireRole(['admin']), createProductType)
router.put('/:id', requireAuth(), requireRole(['admin']), updateProductType)
router.delete('/:id', requireAuth(), requireRole(['admin']), deleteProductType)

export { router as productTypesRoutes }
