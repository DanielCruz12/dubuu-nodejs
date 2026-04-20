import express from 'express'
import { requireAuth } from '@clerk/express'
import { requireRole } from '../../middlewares/role-validator'
import {
  getPublicHostProfile,
  updateOwnHostProfile,
} from '../../controllers/host-profile-controller'

const router = express.Router()

router.patch(
  '/profile',
  requireAuth(),
  requireRole(['host']),
  updateOwnHostProfile,
)
router.get('/:userId/profile', getPublicHostProfile)

export { router as hostProfileRoutes }
