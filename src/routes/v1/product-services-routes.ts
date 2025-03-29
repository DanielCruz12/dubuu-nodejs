import express from 'express'
import {
  createProductService,
  deleteProductService,
  getProductServiceById,
  getProductServices,
} from '../../controllers/product-services-controller'

const router = express.Router()

router.get('/', getProductServices)
router.get('/:id', getProductServiceById)
router.post('/', createProductService)
router.delete('/:id', deleteProductService)

export { router as productServicesRoutes }
