import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
} from '../../controllers/user-controller'
import { requireAuth } from '@clerk/express'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', requireAuth(), requireRole(['host']), getUsers) // Obtener todos los usuarios
router.get('/:id', requireAuth(), requireRole(['host']), getUserById) // Obtener un usuario por ID
router.post('/', createUser) // Crear un nuevo usuario
router.put('/:id', requireAuth(), requireRole(['host']), updateUser) // Actualizar usuario existente
router.delete('/:id', requireAuth(), requireRole(['host']), deleteUser) // Eliminar usuario

export { router as userRoutes }
