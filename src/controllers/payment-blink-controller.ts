import { Request, Response } from 'express'
import { createBlinkCheckout } from '../services/payment-blink-service'
import { createBookingService } from '../services/booking-service'

/**
 * Checkout Blink: crea factura en la API de Blink y responde con
 * paymentRequest, idTransaccion y amount.
 */
export async function handleCreateBlinkTransaction(
  req: Request,
  res: Response,
) {
  try {
    const body = req.body || {}

    const payload = {
      total: body.total,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      amountSats: body.amountSats,
    }

    const result = await createBlinkCheckout(payload)

    if (!result?.paymentRequest || !result?.idTransaccion) {
      return res.status(502).json({
        message:
          'Error al generar el pago con Blink. Intenta de nuevo más tarde.',
      })
    }

    // Si el cliente manda los campos de booking, creamos la reserva en estado pendiente (in-process)
    const bookingInput = body.booking ?? body
    const hasBookingFields =
      Boolean(bookingInput?.user_id) &&
      Boolean(bookingInput?.product_id) &&
      Boolean(bookingInput?.tickets) &&
      Boolean(bookingInput?.tour_date_id ?? bookingInput?.datetime)

    const booking = hasBookingFields
      ? await createBookingService({
          user_id: bookingInput.user_id,
          product_id: bookingInput.product_id,
          tickets: bookingInput.tickets,
          total: body.total,
          tour_date_id: bookingInput.tour_date_id ?? bookingInput.datetime,
          is_live: bookingInput.is_live ?? null,
          paymentMethod: 'blink',
          idTransaccion: result.idTransaccion,
          status: 'in-process',
        })
      : null

    return res.status(200).json({
      paymentRequest: result.paymentRequest,
      idTransaccion: result.idTransaccion,
      amount: result.amount,
      booking,
    })
  } catch (error: any) {
    console.error('Error en createBlinkCheckout:', error)

    return res.status(400).json({
      message:
        error?.message || 'Error al crear la transacción de pago con Blink.',
    })
  }
}
