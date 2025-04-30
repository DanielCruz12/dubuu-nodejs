import { Request, Response } from 'express'
import {
  getBookingByIdService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getBookingsByUserIdProductIdService,
  getUserBookingsService,
} from '../services/booking-service'

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const result = await getUserBookingsService(userId)
    res.status(200).json(result)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}

export const getBookingsByUserIdProductId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, productId } = req.params
    const bookings = await getBookingsByUserIdProductIdService(
      userId,
      productId,
    )
    res.status(200).json(bookings)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const booking = await getBookingByIdService(id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    res.status(200).json(booking)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = await createBookingService(req.body)
    res.status(201).json(newBooking)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedBooking = await updateBookingService(id, req.body)
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }
    res.status(200).json(updatedBooking)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedBooking = await deleteBookingService(id)
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }
    res.status(204).send()
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      message: error.message || 'Error interno del servidor',
    })
  }
}
