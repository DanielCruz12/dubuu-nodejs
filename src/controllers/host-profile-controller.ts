import { Request, Response } from 'express'
import { getAuth } from '@clerk/express'
import {
  getPublicHostProfileByUserId,
  upsertHostProfileForUser,
} from '../services/host-profile-service'

function mapProfileErrorStatus(message: string): number {
  if (message.includes('obligatorio')) return 400
  if (message.includes('Solo los anfitriones')) return 403
  if (
    message.includes('No se encontró') ||
    message.includes('no encontrado')
  ) {
    return 404
  }
  return 500
}

export const getPublicHostProfile = async (req: Request, res: Response) => {
  const { userId } = req.params
  try {
    const locale = req.query.locale as string | undefined
    const data = await getPublicHostProfileByUserId(userId, locale)
    res.status(200).json(data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error inesperado.'
    const status = mapProfileErrorStatus(message)
    if (status === 500) console.error(error)
    res.status(status).json({ message })
  }
}

export const updateOwnHostProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' })
    }
    const data = await upsertHostProfileForUser(userId, req.body ?? {})
    res.status(200).json(data)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error inesperado.'
    const status = mapProfileErrorStatus(message)
    if (status === 500) console.error(error)
    res.status(status).json({ message })
  }
}
