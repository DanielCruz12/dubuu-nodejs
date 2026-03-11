import express from 'express'
import {
  getUserBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUserIdProductId,
  getBookingById,
} from '../../controllers/booking-controller'
import { requireRole } from '../../middlewares/role-validator'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get('/user/:userId', getUserBookings) //comprobado ✅ lista de reservas de un usuario (Mis reservas (user))

router.get(
  '/products/:userId/:productId',
  requireRole(['host']),
  getBookingsByUserIdProductId,
) //lista de reservas de un producto (para la pantalla de reservas en host) (hay que chequear que el usuario tenga su user_id en ese producto primero)

router.get('/:id', getBookingById)
router.post('/', requireAuth(), createBooking)
router.put('/:id', updateBooking)
router.delete('/:id', deleteBooking)

export { router as bookingsRoutes }
