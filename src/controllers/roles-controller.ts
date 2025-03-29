import { Request, Response } from 'express'
import {
  getRolesService,
  getRoleByIdService,
  createRoleService,
  updateRoleService,
  deleteRoleService,
} from '../services/roles-services'
import { statusCodes } from '../utils'

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await getRolesService(req)
    res.status(200).json(roles)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const role = await getRoleByIdService(id)
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.status(200).json(role)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createRole = async (req: Request, res: Response) => {
  try {
    const newRole = await createRoleService(req.body)
    res.status(201).json(newRole)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedRole = await updateRoleService(id, req.body)
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.status(200).json(updatedRole)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await deleteRoleService(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
