import express from 'express'
import {
  getProductTypes,
  getProductTypeById,
  createProductType,
  updateProductType,
  deleteProductType,
} from '../../controllers/product-type-controller'

const router = express.Router()

router.get('/', getProductTypes)
router.get('/:id', getProductTypeById)
router.post('/', createProductType)
router.put('/:id', updateProductType)
router.delete('/:id', deleteProductType)

export { router as productTypesRoutes }
