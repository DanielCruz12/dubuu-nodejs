import express from 'express'
import {
  createProductAmenity,
  deleteProductAmenity,
  getProductAmenityById,
  getProductAmenities,
} from '../../controllers/product-amenities-controller'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', getProductAmenities)
router.get('/:id', getProductAmenityById)
router.post('/', requireRole(['admin']), createProductAmenity)
router.delete('/:id', requireRole(['admin']), deleteProductAmenity)

export { router as productAmenitiesRoutes }
