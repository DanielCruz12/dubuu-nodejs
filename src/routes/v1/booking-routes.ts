import express from 'express'
import {
  getBookings,
  getBookingById,
  getUserBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../../controllers/booking-controller'

const router = express.Router()

router.get('/', getBookings)
router.get('/user/:userId', getUserBookings)
router.get('/:id', getBookingById)
router.post('/', createBooking)
router.put('/:id', updateBooking)
router.delete('/:id', deleteBooking)

export { router as bookingsRoutes }
