import { Request, Response } from 'express'

import { statusCodes } from '../utils'
import {
  getTargetProductAudiencesService,
  getTargetProductAudienceByIdService,
  createTargetProductAudienceService,
  deleteTargetProductAudienceService,
} from '../services/product-audience'

export const getTargetProductAudiences = async (
  req: Request,
  res: Response,
) => {
  try {
    const audiences = await getTargetProductAudiencesService(req)
    res.status(200).json(audiences)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getTargetProductAudienceById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params
    const audience = await getTargetProductAudienceByIdService(id)
    if (!audience) {
      return res.status(404).json({ message: 'Target Audience not found' })
    }
    res.status(200).json(audience)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createTargetProductAudience = async (
  req: Request,
  res: Response,
) => {
  try {
    const newAudience = await createTargetProductAudienceService(req.body)
    res.status(201).json(newAudience)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteTargetProductAudience = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params
    const deleted = await deleteTargetProductAudienceService(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Target Audience not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
