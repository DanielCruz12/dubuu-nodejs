import express from 'express'
import {
  getProductTypes,
  getProductTypeById,
  createProductType,
  updateProductType,
  deleteProductType,
} from '../../controllers/product-type-controller'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', getProductTypes)
router.get('/:id', getProductTypeById)
router.post('/', requireRole(['admin']), createProductType)
router.put('/:id', requireRole(['admin']), updateProductType)
router.delete('/:id', requireRole(['admin']), deleteProductType)

export { router as productTypesRoutes }
