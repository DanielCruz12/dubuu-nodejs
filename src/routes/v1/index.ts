import express from 'express'
import { userRoutes } from './user-routes'
import { productRoutes } from './product-routes'
import { ratingRoutes } from './rating-routes'
import { productCategoriesRoutes } from './product-category-routes'
import { productAudiencesRoutes } from './product-audience-routes'
import { rolesRoutes } from './roles-routes'
import { bookingsRoutes } from './booking-routes'
import { commentsRoutes } from './comment-routes'
import { faqsRoutes } from './faq-routes'
import { productAmenitiesRoutes } from './product-amenities-routes'
import { productTypesRoutes } from './product-types-routes'
import { requireAuth } from '@clerk/express'
import { requireRole } from '../../middlewares/role-validator'
import { paymentAccountRoutes } from './payment-account-routes'
import { favoritesRoutes } from './favorite-routes'
import { contactRoutes } from './contact-routes'
import { exchangeRoutes } from './exchangeRoutes'
import blogRoutes from './blog-routes'
import { panelRoutes } from './panel-routes'

const router = express.Router()

router.use('/ratings', ratingRoutes)
router.use('/users', requireAuth(), userRoutes)
router.use('/panel', panelRoutes)
router.use(
  '/payments',
  requireAuth(),
  requireRole(['host']),
  paymentAccountRoutes,
)
router.use('/bookings', requireAuth(), bookingsRoutes)
router.use('/contact', requireAuth() ,contactRoutes)
router.use('/products', productRoutes)
router.use('/favorite', requireAuth(), favoritesRoutes)
router.use('/product-amenities', productAmenitiesRoutes)
router.use('/product-types', productTypesRoutes)
router.use('/product-category', productCategoriesRoutes)
router.use('/product-audience', productAudiencesRoutes)
router.use('/roles', rolesRoutes)
router.use('/comments', commentsRoutes)
router.use('/faqs', faqsRoutes)
router.use('/exchange', exchangeRoutes)
router.use('/blog', blogRoutes)

export { router as apiRoutes }
