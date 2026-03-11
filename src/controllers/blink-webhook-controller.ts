import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { updateBookingStatusByTransactionId } from '../services/booking-service'
import { BookingStatus } from '../constants'
import { getIO, getUserRoom } from '../socket'

const BLINK_WEBHOOK_SECRET = process.env.BLINK_WEBHOOK_SECRET

export async function handleBlinkWebhook(req: Request, res: Response) {
  if (!BLINK_WEBHOOK_SECRET) {
    console.error('BLINK_WEBHOOK_SECRET no configurado; webhook rechazado.')
    return res.status(503).send('Webhook no configurado')
  }

  const rawBody =
    (req as any).rawBody ??
    (typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}))

  try {
    const wh = new Webhook(BLINK_WEBHOOK_SECRET)
    wh.verify(rawBody, req.headers as any)
  } catch (err) {
    console.error('Blink webhook signature invalid:', err)
    return res.status(403).send('Firma inválida')
  }

  try {
    const eventType = req.body?.eventType
    const txStatus = req.body?.transaction?.status
    const paymentHash = req.body?.transaction?.initiationVia?.paymentHash

    // Blink envia "receive.lightning" con transaction.status = "success" cuando la factura se paga.
    if (eventType?.startsWith('receive.') && txStatus === 'success' && paymentHash) {
      const updatedBooking = await updateBookingStatusByTransactionId(
        paymentHash,
        BookingStatus.COMPLETED,
      )
      if (updatedBooking?.user_id) {
        getIO()
          .to(getUserRoom(updatedBooking.user_id))
          .emit('payment:completed', {
            bookingId: updatedBooking.id,
            status: BookingStatus.COMPLETED,
          })
      }
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error('Error al manejar webhook Blink:', error)
    return res.status(500).send('Error interno del servidor al manejar el webhook.')
  }
}

