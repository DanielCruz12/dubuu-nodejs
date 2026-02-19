/**
 * Checkout Blink: crea una factura en la API de Blink (lnUsdInvoiceCreate / lnInvoiceCreate)
 * y devuelve el QR generado desde el paymentRequest y la factura LN para copiar.
 * Documentación: https://dev.blink.sv/api/btc-ln-receive y https://dev.blink.sv/api/usd-ln-receive
 */

import { createUsdInvoice } from './blink-service'

export interface CreateBlinkCheckoutPayload {
  /** Total a cobrar en USD (ej. 25). Se convierte a centavos para la factura Stablesats. */
  total: number
  email?: string
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  /** Si se envía, se crea factura en BTC por esa cantidad en satoshis (total se ignora). */
  amountSats?: number
}

export interface CreateBlinkCheckoutResult {
  /** Factura Lightning (BOLT11) para copiar y pegar en Blink u otra wallet. */
  paymentRequest: string
  idTransaccion: string
  amount: number
}

/**
 * Crea una factura en Blink (USD por defecto, o BTC si viene amountSats),
 * genera el QR desde el paymentRequest y devuelve factura LN + QR para copiar.
 */
export async function createBlinkCheckout(
  payload: CreateBlinkCheckoutPayload,
): Promise<CreateBlinkCheckoutResult> {
  const { total, amountSats } = payload

  if (amountSats != null && amountSats > 0) {
    const { createBtcInvoice } = await import('./blink-service')
    const invoice = await createBtcInvoice(amountSats)
    return {
      paymentRequest: invoice.paymentRequest,
      idTransaccion: invoice.paymentHash,
      amount: amountSats,
    }
  }

  const amountNum = Number(total)
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error('El total debe ser un número mayor que 0.')
  }
  const amountCents = Math.round(amountNum * 100)
  if (amountCents < 1) {
    throw new Error('El total es demasiado bajo para generar factura.')
  }

  const invoice = await createUsdInvoice(amountCents)

  return {
    paymentRequest: invoice.paymentRequest,
    idTransaccion: invoice.paymentHash,
    amount: amountNum,
  }
}
