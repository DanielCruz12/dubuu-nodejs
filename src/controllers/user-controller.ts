import { Request, Response } from 'express'
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from '../services/user-service'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsersService()
    res.status(200).json(users)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const user = await getUserByIdService(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { email, id, username, last_name, first_name } = req.body
  try {
    const data = await createUserService({
      email,
      id,
      username,
      last_name,
      first_name,
    })
    res.status(201).json({ message: 'User created successfully', data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const { email, username, first_name, last_name } = req.body
  try {
    const updatedUser = await updateUserService(id, {
      email,
      username,
      first_name,
      last_name,
    })
    res.status(200).json({ message: 'User updated successfully', updatedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const deletedUser = await deleteUserService(id)
    res.status(200).json({ message: 'User deleted successfully', deletedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
