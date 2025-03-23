import express from 'express'
import {
  createRating,
  deleteRating,
  getRatingById,
  getRatings,
} from '../../controllers/rating-controller'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating management endpoints
 */

/**
 * @swagger
 * /api/v1/ratings:
 *   get:
 *     summary: Retrieve all ratings
 *     description: Fetch all ratings with optional pagination and filters.
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of ratings per page
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by product ID
 *     responses:
 *       200:
 *         description: A list of ratings
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getRatings)

router.get('/:id', getRatingById)

router.post('/', createRating)

router.delete('/:id', deleteRating)

export { router as ratingRoutes }
