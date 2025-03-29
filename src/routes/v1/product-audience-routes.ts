import express from 'express'
import {
  createTargetProductAudience,
  deleteTargetProductAudience,
  getTargetProductAudienceById,
  getTargetProductAudiences,
} from '../../controllers/product-audience-controller'

const router = express.Router()

router.get('/', getTargetProductAudiences)
router.get('/:id', getTargetProductAudienceById)
router.post('/', createTargetProductAudience)
router.delete('/:id', deleteTargetProductAudience)

export { router as productAudiencesRoutes }
