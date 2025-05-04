import express from 'express'
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from '../../controllers/favorite-controller'

const router = express.Router()

// ✅ Obtener favoritos de un usuario
router.get('/user/:userId', getUserFavorites)

// ✅ Agregar un nuevo favorito (solo para rol user)
router.post('/', addFavorite)

// ✅ Eliminar un favorito (solo para rol user)
router.delete('/', removeFavorite)

export { router as favoritesRoutes }
