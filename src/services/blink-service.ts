/**
 * Servicio para enviar pagos (payouts) a hosts vía Blink (Bitcoin / Lightning).
 * Requiere BLINK_API_KEY en el entorno. Documentación: https://dev.blink.sv/
 */

import axios, { AxiosInstance } from 'axios'

const BLINK_GRAPHQL_URL = process.env.BLINK_GRAPHQL_URL || 'https://api.blink.sv/graphql'

function getBlinkClient(): AxiosInstance {
  const apiKey = process.env.BLINK_API_KEY
  if (!apiKey?.trim()) {
    throw new Error('BLINK_API_KEY no está configurada. Configúrala para enviar pagos con Blink.')
  }
  return axios.create({
    baseURL: BLINK_GRAPHQL_URL,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey.trim(),
    },
  })
}

type BlinkWallet = { id: string; walletCurrency: string; balance: number }

export interface BlinkWalletsResult {
  btcWalletId: string | null
  usdWalletId: string | null
  wallets: BlinkWallet[]
}

/**
 * Obtiene los IDs de las wallets BTC y USD de la cuenta Blink (para enviar desde ellas).
 */
export async function getBlinkWallets(): Promise<BlinkWalletsResult> {
  const client = getBlinkClient()
  const { data } = await client.post<{
    data?: {
      me?: {
        defaultAccount?: {
          wallets?: BlinkWallet[]
        }
      }
    }
  }>('', {
    query: `
      query Me {
        me {
          defaultAccount {
            wallets {
              id
              walletCurrency
              balance
            }
          }
        }
      }
    `,
  })

  const wallets = data?.data?.me?.defaultAccount?.wallets ?? []
  const btc = wallets.find((w) => w.walletCurrency === 'BTC')
  const usd = wallets.find((w) => w.walletCurrency === 'USD')

  return {
    btcWalletId: btc?.id ?? null,
    usdWalletId: usd?.id ?? null,
    wallets,
  }
}

/**
 * Envía BTC a una Lightning Address (ej. usuario@blink.sv).
 * @param lnAddress - Dirección Lightning o Blink (blink_wallet_address del host)
 * @param amountSats - Cantidad en satoshis
 * @param walletId - Opcional; si no se pasa, se usa la wallet BTC por defecto de la API Key
 */
export async function sendBtcToLightningAddress(
  lnAddress: string,
  amountSats: number,
  walletId?: string,
): Promise<{ status: string; errors?: Array<{ message: string; code?: string }> }> {
  const client = getBlinkClient()
  let wId = walletId
  if (!wId) {
    const { btcWalletId } = await getBlinkWallets()
    if (!btcWalletId) throw new Error('No se encontró wallet BTC en la cuenta Blink.')
    wId = btcWalletId
  }

  const { data } = await client.post<{
    data?: {
      lnAddressPaymentSend?: {
        status: string
        errors?: Array<{ message: string; code?: string; path?: string[] }>
      }
    }
  }>('', {
    query: `
      mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
        lnAddressPaymentSend(input: $input) {
          status
          errors { message code path }
        }
      }
    `,
    variables: {
      input: {
        lnAddress: lnAddress.trim(),
        amount: Math.round(amountSats),
        walletId: wId,
      },
    },
  })

  const result = data?.data?.lnAddressPaymentSend
  if (!result) {
    throw new Error('Respuesta inválida de Blink al enviar BTC.')
  }
  return { status: result.status, errors: result.errors }
}

/**
 * Envía USD (Stablesats) a una Lightning Address.
 * @param lnAddress - Dirección Lightning o Blink del host
 * @param amountCents - Cantidad en centavos de USD
 * @param walletId - Opcional; si no se pasa, se usa la wallet USD por defecto
 */
export async function sendUsdToLightningAddress(
  lnAddress: string,
  amountCents: number,
  walletId?: string,
): Promise<{ status: string; errors?: Array<{ message: string; code?: string }> }> {
  const client = getBlinkClient()
  let wId = walletId
  if (!wId) {
    const { usdWalletId } = await getBlinkWallets()
    if (!usdWalletId) throw new Error('No se encontró wallet USD en la cuenta Blink.')
    wId = usdWalletId
  }

  const { data } = await client.post<{
    data?: {
      lnAddressPaymentSend?: {
        status: string
        errors?: Array<{ message: string; code?: string; path?: string[] }>
      }
    }
  }>('', {
    query: `
      mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
        lnAddressPaymentSend(input: $input) {
          status
          errors { message code path }
        }
      }
    `,
    variables: {
      input: {
        lnAddress: lnAddress.trim(),
        amount: Math.round(amountCents),
        walletId: wId,
      },
    },
  })

  const result = data?.data?.lnAddressPaymentSend
  if (!result) {
    throw new Error('Respuesta inválida de Blink al enviar USD.')
  }
  return { status: result.status, errors: result.errors }
}

// --- Checkout: crear factura para que el cliente pague (recibir en nuestra cuenta Blink) ---

export interface BlinkInvoiceResult {
  paymentRequest: string
  paymentHash: string
  paymentSecret?: string
  satoshis?: number
}

/**
 * Crea una factura Lightning en BTC (satoshis) para recibir pago.
 * El cliente paga el paymentRequest y el dinero llega a la wallet BTC de la API Key.
 */
export async function createBtcInvoice(
  amountSats: number,
  walletId?: string,
): Promise<BlinkInvoiceResult> {
  const client = getBlinkClient()
  let wId = walletId
  if (!wId) {
    const { btcWalletId } = await getBlinkWallets()
    if (!btcWalletId) throw new Error('No se encontró wallet BTC en la cuenta Blink.')
    wId = btcWalletId
  }

  const { data } = await client.post<{
    data?: {
      lnInvoiceCreate?: {
        invoice?: {
          paymentRequest: string
          paymentHash: string
          paymentSecret?: string
          satoshis?: number
        }
        errors?: Array<{ message: string }>
      }
    }
  }>('', {
    query: `
      mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
        lnInvoiceCreate(input: $input) {
          invoice { paymentRequest paymentHash paymentSecret satoshis }
          errors { message }
        }
      }
    `,
    variables: {
      input: {
        walletId: wId,
        amount: Math.round(amountSats),
      },
    },
  })

  const result = data?.data?.lnInvoiceCreate
  const errs = result?.errors
  if (errs?.length) {
    throw new Error(errs.map((e) => e.message).join('; '))
  }
  const invoice = result?.invoice
  if (!invoice?.paymentRequest || !invoice?.paymentHash) {
    throw new Error('Blink no devolvió factura válida.')
  }
  return {
    paymentRequest: invoice.paymentRequest,
    paymentHash: invoice.paymentHash,
    paymentSecret: invoice.paymentSecret,
    satoshis: invoice.satoshis,
  }
}

/**
 * Crea una factura Stablesats en USD (centavos) para recibir pago.
 * El cliente paga el paymentRequest; el saldo se acredita en USD en la wallet USD de la API Key.
 */
export async function createUsdInvoice(
  amountCents: number,
  walletId?: string,
): Promise<BlinkInvoiceResult> {
  const client = getBlinkClient()
  let wId = walletId
  if (!wId) {
    const { usdWalletId } = await getBlinkWallets()
    if (!usdWalletId) throw new Error('No se encontró wallet USD en la cuenta Blink.')
    wId = usdWalletId
  }

  const { data } = await client.post<{
    data?: {
      lnUsdInvoiceCreate?: {
        invoice?: {
          paymentRequest: string
          paymentHash: string
          paymentSecret?: string
          satoshis?: number
        }
        errors?: Array<{ message: string }>
      }
    }
  }>('', {
    query: `
      mutation LnUsdInvoiceCreate($input: LnUsdInvoiceCreateInput!) {
        lnUsdInvoiceCreate(input: $input) {
          invoice { paymentRequest paymentHash paymentSecret satoshis }
          errors { message }
        }
      }
    `,
    variables: {
      input: {
        walletId: wId,
        amount: Math.round(amountCents),
      },
    },
  })

  const result = data?.data?.lnUsdInvoiceCreate
  const errs = result?.errors
  if (errs?.length) {
    throw new Error(errs.map((e) => e.message).join('; '))
  }
  const invoice = result?.invoice
  if (!invoice?.paymentRequest || !invoice?.paymentHash) {
    throw new Error('Blink no devolvió factura USD válida.')
  }
  return {
    paymentRequest: invoice.paymentRequest,
    paymentHash: invoice.paymentHash,
    paymentSecret: invoice.paymentSecret,
    satoshis: invoice.satoshis,
  }
}
