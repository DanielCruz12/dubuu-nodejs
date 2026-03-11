import express from 'express'
import {
  createTargetProductAudience,
  deleteTargetProductAudience,
  getTargetProductAudienceById,
  getTargetProductAudiences,
} from '../../controllers/product-audience-controller'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', getTargetProductAudiences)
router.get('/:id', getTargetProductAudienceById)
router.post('/', requireRole(['admin']), createTargetProductAudience)
router.delete('/:id', requireRole(['admin']), deleteTargetProductAudience)

export { router as productAudiencesRoutes }
