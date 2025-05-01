import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsByUserId,
  getProductsByUserIdSimplified,
} from '../../controllers/product-controller'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.get('/user/:id', getProductsByUserId)
router.get('/usersimplified/:id', requireAuth(), getProductsByUserIdSimplified)
router.post('/', requireAuth(), createProduct)
router.delete('/:id', requireAuth(), deleteProduct)

export { router as productRoutes }
