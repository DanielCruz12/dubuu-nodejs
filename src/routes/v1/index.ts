import express from 'express'
import { userRoutes } from './user-routes'
import { productRoutes } from './product-routes'
import { ratingRoutes } from './rating-routes'

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/ratings', ratingRoutes)

export { router as apiRoutes }
