import express from 'express'
import { userRoutes } from './user-routes'
import { productRoutes } from './product-routes'

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)

export { router as apiRoutes }
