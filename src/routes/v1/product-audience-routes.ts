import express from 'express'
import {
  createTargetProductAudience,
  deleteTargetProductAudience,
  getTargetProductAudienceById,
  getTargetProductAudiences,
} from '../../controllers/product-audience-controller'
import { requireRole } from '../../middlewares/role-validator'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/', getTargetProductAudiences)
router.get('/:id', getTargetProductAudienceById)
router.post('/', requireAuth(), requireRole(['admin']), createTargetProductAudience)
router.delete('/:id', requireAuth(), requireRole(['admin']), deleteTargetProductAudience)

export { router as productAudiencesRoutes }
