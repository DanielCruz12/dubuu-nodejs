import express from 'express'
import {
  createProductAmenity,
  deleteProductAmenity,
  getProductAmenityById,
  getProductAmenities,
} from '../../controllers/product-amenities-controller'
import { requireRole } from '../../middlewares/role-validator'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/', getProductAmenities)
router.get('/:id', getProductAmenityById)
router.post('/', requireAuth(), requireRole(['admin']), createProductAmenity)
router.delete('/:id', requireAuth(), requireRole(['admin']), deleteProductAmenity)

export { router as productAmenitiesRoutes }
