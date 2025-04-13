import { Request, Response } from 'express'
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from '../services/user-service'

// Express controller
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsersService()
    return res.status(200).json(users)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Express controller
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const user = await getUserByIdService(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json(user)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Reusable (for both API and webhook)
export const createUser = async ({
  email,
  id,
  username,
  first_name,
  last_name,
}: {
  email: string
  id: string
  username: string
  first_name: string
  last_name: string
}) => {
  try {
    const data = await createUserService({
      email,
      id,
      username,
      first_name,
      last_name,
    })
    return { status: 201, data: { message: 'User created successfully', data } }
  } catch (error) {
    console.error(error)
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}

// Reusable
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    email,
    username,
    first_name,
    last_name,
    address,
    city,
    country,
    id_region,
    phone_number,
    zip_code,
  } = req.body

  try {
    const updatedUser = await updateUserService(id, {
      email,
      username,
      first_name,
      last_name,
      address,
      city,
      country,
      id_region,
      phone_number,
      zip_code,
    })

    return res
      .status(200)
      .json({ message: 'User updated successfully', updatedUser })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}


// Reusable
export const deleteUser = async (id: string) => {
  try {
    const deletedUser = await deleteUserService(id)
    return {
      status: 200,
      data: { message: 'User deleted successfully', deletedUser },
    }
  } catch (error) {
    console.error(error)
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}
