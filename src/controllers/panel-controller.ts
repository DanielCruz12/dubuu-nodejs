import { Request, Response } from 'express'
import {
  getActiveReservationsCount,
  getTotalRevenue,
  getFrequentTravelersCount,
  getReservationActivityLast12Months,
  getUpcomingReservations,
  getPanelSummary,
} from '../services/panel-service'

/** userId obligatorio en req.body. */
const getUserId = (req: Request): string | null => {
  const id = req.body?.userId
  return typeof id === 'string' && id.trim() ? id.trim() : null
}

/**
 * GET /panel/summary
 * Resumen completo del panel (todas las métricas en una respuesta).
 */
export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const summary = await getPanelSummary(userId)
    return res.status(200).json(summary)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener el resumen del panel',
    })
  }
}

/**
 * GET /panel/active-reservations
 * Cuenta de reservas activas y comparación con el mes pasado.
 */
export const getActiveReservations = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const data = await getActiveReservationsCount(userId)
    return res.status(200).json(data)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener reservas activas',
    })
  }
}

/**
 * GET /panel/revenue
 * Ingresos totales y comparación con el año pasado.
 */
export const getRevenue = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const data = await getTotalRevenue(userId)
    return res.status(200).json(data)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener ingresos',
    })
  }
}

/**
 * GET /panel/frequent-travelers
 * Cantidad de viajeros frecuentes (personas que han reservado 2+ veces con el host).
 */
export const getFrequentTravelers = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const data = await getFrequentTravelersCount(userId)
    return res.status(200).json(data)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener viajeros frecuentes',
    })
  }
}

/**
 * GET /panel/activity
 * Actividad de reservas por mes (últimos 12 meses) para el gráfico.
 */
export const getActivity = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const data = await getReservationActivityLast12Months(userId)
    return res.status(200).json(data)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener actividad de reservas',
    })
  }
}

/**
 * GET /panel/upcoming
 * Próximas reservas. Query: ?limit=10
 */
export const getUpcoming = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio en el body' })
    }
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const data = await getUpcomingReservations(userId, limit)
    return res.status(200).json(data)
  } catch (error: any) {
    const statusCode = error.statusCode ?? 500
    return res.status(statusCode).json({
      message: error.message ?? 'Error al obtener próximas reservas',
    })
  }
}
