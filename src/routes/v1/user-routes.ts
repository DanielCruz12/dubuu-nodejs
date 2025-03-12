import express from 'express'
import { getUsers } from '../../controllers/user-controller'

const router = express.Router()

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 */

router.get('/', getUsers) //* Route to get all events

export { router as userRoutes }
