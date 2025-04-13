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
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const user = await getUserByIdService(id)
    if (!user) {
      return { status: 404, data: { message: 'User not found' } }
    }
    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}

export const createUser = async (req: Request) => {
  const { email, id, username, last_name, first_name } = req.body
  try {
    const data = await createUserService({
      email,
      id,
      username,
      last_name,
      first_name,
    })
    return { status: 201, data: { message: 'User created successfully', data } }
  } catch (error) {
    console.error(error)
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    email,
    username,
    first_name,
    last_name,
    phone_number,
    address,
    city,
    id_region,
    zip_code,
    country,
  } = req.body

  if (!email || !username || !first_name || !last_name || !phone_number) {
    return res.status(400).json({
      message: 'Email, username, first name, and last name son requeridos',
    })
  }
  try {
    const updatedUser = await updateUserService(id, {
      email,
      username,
      phone_number,
      first_name,
      last_name,
      address,
      city,
      id_region,
      zip_code,
      country,
    })
    return res.status(200).json(updatedUser)
  } catch (error) {
    console.error(error)
    return { status: 500, data: { message: 'Internal Server Error' } }
  }
}

export const deleteUser = async (req: Request) => {
  const { id } = req.params
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
