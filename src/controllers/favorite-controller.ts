import { Request, Response } from 'express'
import {
  getFavoritesByUserService,
  addFavoriteService,
  removeFavoriteService,
} from '../services/favorite-service'

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const favorites = await getFavoritesByUserService(userId)
    res.status(200).json(favorites)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    res
      .status(statusCode)
      .json({ message: error.message || 'Error interno del servidor' })
  }
}

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body
    const favorite = await addFavoriteService({ userId, productId })
    if (!favorite) {
      return res
        .status(400)
        .json({ message: 'Datos inválidos o favorito ya existente' })
    }
    res.status(201).json(favorite)
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    res
      .status(statusCode)
      .json({ message: error.message || 'Error interno del servidor' })
  }
}

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body
    const deletedFavorite = await removeFavoriteService({ userId, productId })
    if (!deletedFavorite) {
      return res.status(404).json({ message: 'Favorito no encontrado' })
    }
    res.status(204).send()
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    res
      .status(statusCode)
      .json({ message: error.message || 'Error interno del servidor' })
  }
}
