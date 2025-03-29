import express from 'express'
import { userRoutes } from './user-routes'
import { productRoutes } from './product-routes'
import { ratingRoutes } from './rating-routes'
import { productServicesRoutes } from './product-services-routes'
import { productCategoriesRoutes } from './product-category-routes'
import { productAudiencesRoutes } from './product-audience-routes'

const router = express.Router()

router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/product-services', productServicesRoutes)
router.use('/product-category', productCategoriesRoutes)
router.use('/product-audience', productAudiencesRoutes)
router.use('/ratings', ratingRoutes)

export { router as apiRoutes }
