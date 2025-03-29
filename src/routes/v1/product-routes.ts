import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from '../../controllers/product-controller'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.delete('/:id', deleteProduct)

export { router as productRoutes }
