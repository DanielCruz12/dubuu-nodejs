import type { Request, Response } from 'express'
import {
  createPaymentAccount,
  getPaymentAccountsByUser,
  deletePaymentAccount,
  updatePaymentAccount,
} from '../services/payment-service'

export async function createPaymentAccountController(
  req: Request,
  res: Response,
) {
  try {
    const paymentAccount = await createPaymentAccount(req.body)

    return res.status(201).json(paymentAccount)
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Error al crear la cuenta de pago.',
    })
  }
}

export async function getPaymentAccountsByUserController(
  req: Request,
  res: Response,
) {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario es requerido.' })
    }

    const accounts = await getPaymentAccountsByUser(userId)

    return res.status(200).json(accounts)
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Error al obtener las cuentas de pago.',
    })
  }
}

export async function deletePaymentAccountController(
  req: Request,
  res: Response,
) {
  try {
    const { accountId } = req.params
    const { userId } = req.params
    // (o también puedes sacar userId desde `req.user.id` si estás usando autenticación)

    if (!accountId || !userId) {
      return res
        .status(400)
        .json({ error: 'ID de cuenta y usuario requeridos.' })
    }

    const result = await deletePaymentAccount(accountId, userId)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Error al eliminar la cuenta de pago.',
    })
  }
}

export async function updatePaymentAccountController(
  req: Request,
  res: Response,
) {
  try {
    const { accountId } = req.params
    const { userId } = req.params
    const updateData = req.body

    if (!accountId || !userId) {
      return res
        .status(400)
        .json({ error: 'ID de cuenta y usuario requeridos.' })
    }

    const result = await updatePaymentAccount(accountId, updateData)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Error al actualizar la cuenta de pago.',
    })
  }
}
