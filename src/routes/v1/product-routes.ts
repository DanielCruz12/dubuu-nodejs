import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsByUserId,
  getProductsByUserIdSimplified,
} from '../../controllers/product-controller'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.get('/user/:id', getProductsByUserId)
router.get('/usersimplified/:id', getProductsByUserIdSimplified)
router.post('/', createProduct)
router.delete('/:id', deleteProduct)

export { router as productRoutes }
