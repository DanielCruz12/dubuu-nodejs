import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
} from '../../controllers/user-controller'

const router = express.Router()

router.get('/', getUsers)           // Obtener todos los usuarios
router.get('/:id', getUserById)     // Obtener un usuario por ID
router.post('/', createUser)        // Crear un nuevo usuario
router.put('/:id', updateUser)      // Actualizar usuario existente
router.delete('/:id', deleteUser)   // Eliminar usuario

export { router as userRoutes }
