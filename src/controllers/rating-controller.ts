import { Request, Response } from 'express'
import {
  createRatingService,
  deleteRatingService,
  getRatingByIdService,
  getRatingsService,
} from '../services/rating-service'
import { statusCodes } from '../utils'

export const getRatings = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    return res
      .status(400)
      .json({ message: 'El parámetro "productId" es obligatorio.' })
  }
  try {
    const ratings = await getRatingsService(id)
    res.status(200).json(ratings)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status).json({ message })
  }
}

export const getRatingById = async (req: Request, res: Response) => {
  try {
    const ratingId = req.params.id
    const rating = await getRatingByIdService(ratingId)
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' })
    }
    res.status(200).json(rating)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status).json({ message })
  }
}

export const createRating = async (req: Request, res: Response) => {
  try {
    const rating = await createRatingService(req)
    res.status(201).json(rating)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error', error })
  }
}

export const deleteRating = async (req: Request, res: Response) => {
  try {
    const ratingId = req.params.id
    const result = await deleteRatingService(ratingId)
    if (!result) {
      return res.status(404).json({ message: 'Rating not found' })
    }
    res.status(204).send()
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status).json({ message })
  }
}
