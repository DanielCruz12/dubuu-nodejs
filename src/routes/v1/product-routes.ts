import express from 'express'
import { getProducts } from '../../controllers/product-controller'

const router = express.Router()

/**
 * @swagger
 * /api/v1/products/:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: A list of products
 */

router.get('/', getProducts) //* Route to get all products

export { router as productRoutes }
