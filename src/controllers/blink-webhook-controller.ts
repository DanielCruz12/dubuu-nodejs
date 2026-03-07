import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { updateBookingStatusByTransactionId } from '../services/booking-service'
import { BookingStatus } from '../constants'

const BLINK_WEBHOOK_SECRET = process.env.BLINK_WEBHOOK_SECRET

export async function handleBlinkWebhook(req: Request, res: Response) {
  const rawBody =
    (req as any).rawBody ??
    (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}))

  // Verificación de firma (Svix). Si no hay secret configurado, aceptamos igual.
  if (BLINK_WEBHOOK_SECRET) {
    try {
      const wh = new Webhook(BLINK_WEBHOOK_SECRET)
      wh.verify(rawBody, req.headers as any)
    } catch (err) {
      console.error('Blink webhook signature invalid:', err)
      return res.status(403).send('Invalid webhook signature')
    }
  }

  try {
    const eventType = req.body?.eventType
    const txStatus = req.body?.transaction?.status
    const paymentHash = req.body?.transaction?.initiationVia?.paymentHash

    // Blink envia "receive.lightning" con transaction.status = "success" cuando la factura se paga.
    if (eventType?.startsWith('receive.') && txStatus === 'success' && paymentHash) {
      await updateBookingStatusByTransactionId(paymentHash, BookingStatus.COMPLETED)
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error('Error al manejar webhook Blink:', error)
    return res.status(500).send('Error interno del servidor al manejar el webhook.')
  }
}

