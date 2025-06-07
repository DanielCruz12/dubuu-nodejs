import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsByUserId,
  getProductsByUserIdSimplified,
} from '../../controllers/product-controller'
import { requireAuth } from '@clerk/express'
import { upload } from '../../middlewares/multer'
import { validateCreateProduct } from '../../middlewares/product-validation'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.get('/user/:id', getProductsByUserId)
router.get('/usersimplified/:id', requireAuth(), getProductsByUserIdSimplified)

router.post(
  '/',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'banner', maxCount: 1 },
    { name: 'files', maxCount: 5 },
    { name: 'videos', maxCount: 3 },
  ]),
  validateCreateProduct,
  createProduct,
)

// Eliminar producto (siempre con archivos)
router.delete('/:id', requireAuth(), deleteProduct)

// Middleware para manejar errores de Multer
router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (
      error instanceof Error &&
      error.message.includes('Tipo de archivo no permitido')
    ) {
      return res.status(400).json({
        message: error.message,
      })
    }
    next(error)
  },
)

export { router as productRoutes }
