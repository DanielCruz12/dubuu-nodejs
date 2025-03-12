import { Request, Response } from 'express'
import { getUsersService } from '../services/user-service'

export const getUsers = async (req: Request, res: Response) => {
    try {
      const users = await getUsersService()
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' })
    }
  }