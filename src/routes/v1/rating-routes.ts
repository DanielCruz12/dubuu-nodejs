import express from 'express'
import {
  createRating,
  deleteRating,
  getRatingById,
  getRatings,
} from '../../controllers/rating-controller'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/:id', getRatings)
router.get('/:id', getRatingById)
router.post('/', requireAuth(), createRating)
router.delete('/:id', requireAuth(), deleteRating)

export { router as ratingRoutes }
