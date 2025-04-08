import { Request, Response } from 'express'
import crypto from 'crypto'
import { updateBookingStatusByTransactionId } from '../services/booking-service'

const WOMPI_SECRET = process.env.WOMPI_CLIENT_SECRET || 'TU_API_SECRET'

export const handleWompiWebhook = async (req: Request, res: Response) => {
  const rawBody = (req as any).rawBody
  const wompiHashHeader = req.headers['wompi_hash']

  if (!wompiHashHeader || typeof wompiHashHeader !== 'string') {
    return res.status(400).send('Falta o es inválido el header wompi_hash')
  }

  const hmac = crypto.createHmac('sha256', WOMPI_SECRET)
  hmac.update(rawBody)
  const calculatedHash = hmac.digest('hex')

  if (calculatedHash !== wompiHashHeader) {
    return res.status(403).send('☠️❌❌Hash inválido')
  }

  const webhookData = req.body

  try {
    const transactionId = webhookData?.IdTransaccion

    if (transactionId) {
      await updateBookingStatusByTransactionId(transactionId, 'completed')
    } else {
      console.warn('⚠️ No se encontró ID de transacción en el webhook')
    }

    res.sendStatus(200)
  } catch (error) {
    console.error('🚨 Error al manejar el webhook:', error)
    res.status(500).send('Error interno del servidor al manejar el webhook.')
  }
}
