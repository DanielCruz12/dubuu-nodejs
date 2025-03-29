import { Request, Response } from 'express'
import {
  getBookingsService,
  getBookingByIdService,
  getBookingsForUserService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
} from '../services/booking-service'
import { statusCodes } from '../utils'

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await getBookingsService()
    res.status(200).json(bookings)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
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
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const result = await getBookingsForUserService(userId)
    res.status(200).json(result)
  } catch (error: any) {
    const status = error.status || 500
    res
      .status(status)
      .json({ message: error.message || 'Internal Server Error' })
  }
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = await createBookingService(req.body)
    res.status(201).json(newBooking)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedBooking = await updateBookingService(id, req.body)
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    res.status(200).json(updatedBooking)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedBooking = await deleteBookingService(id)
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
