import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
} from '../../controllers/user-controller'
import { requireRole } from '../../middlewares/role-validator'

const router = express.Router()

router.get('/', requireRole(['host']), getUsers)
router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export { router as userRoutes }
