import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from '../../controllers/product-controller'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Retrieve all products
 *     description: Fetch all products with optional pagination and filters.
 *     tags: [Products]
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
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by product category
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Internal server error
 */
router.get('/', getProducts)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve detailed information about a specific product.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getProductById)

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     description: Adds a new product to the database.
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - departure_point
 *               - max_people
 *               - duration
 *               - product_category_id
 *               - product_service_id
 *               - target_product_audience_id
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Amazing place In Los Angeles"
 *               description:
 *                 type: string
 *                 example: "Enjoy a luxurious stay at the Grand Palace Hotel..."
 *               price:
 *                 type: number
 *                 example: 450.00
 *               departure_point:
 *                 type: string
 *                 example: "San Salvador calle 14, pol 2"
 *               max_people:
 *                 type: integer
 *                 example: 50
 *               duration:
 *                 type: integer
 *                 example: 1
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [""]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/file.pdf"]
 *               banner:
 *                 type: string
 *                 example: "https://example.com/banner.jpg"
 *               product_category_id:
 *                 type: string
 *                 example: "d80539a1-512e-4044-b5b9-8c302cbf745f"
 *               product_service_id:
 *                 type: string
 *                 example: "37f295d0-4cc6-40ef-bdef-7682a1c513a3"
 *               target_product_audience_id:
 *                 type: string
 *                 example: "d86db85f-40c1-4f9a-bf27-fb1029a174a2"
 *               user_id:
 *                 type: string
 *                 example: "560b600d-418f-426a-a680-c7b3ad507a5f"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */
router.post('/', createProduct)

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Removes a product from the database.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteProduct)

export { router as productRoutes }
