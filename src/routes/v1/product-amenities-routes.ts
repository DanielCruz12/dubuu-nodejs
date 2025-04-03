import express from 'express'
import {
  createProductAmenity,
  deleteProductAmenity,
  getProductAmenityById,
  getProductAmenities,
} from '../../controllers/product-amenities-controller'

const router = express.Router()

router.get('/', getProductAmenities)
router.get('/:id', getProductAmenityById)
router.post('/', createProductAmenity)
router.delete('/:id', deleteProductAmenity)

export { router as productAmenitiesRoutes }
