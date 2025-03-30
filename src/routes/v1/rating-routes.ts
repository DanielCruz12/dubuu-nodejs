import express from 'express'
import {
  createRating,
  deleteRating,
  getRatingById,
  getRatings,
} from '../../controllers/rating-controller'

const router = express.Router()

router.get('/:id', getRatings)
router.get('/:id', getRatingById)
router.post('/', createRating)
router.delete('/:id', deleteRating)

export { router as ratingRoutes }
