import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/user-controller'

const router = express.Router()

router.get('/', getUsers) //* Route to get all users
router.get('/:id', getUserById) //* Route to get a user by id
router.post('/', createUser) //* Route to create a new user
router.put('/:id', updateUser) //* Route to update a user
router.delete('/:id', deleteUser) //* Route to delete a user

export { router as userRoutes }
