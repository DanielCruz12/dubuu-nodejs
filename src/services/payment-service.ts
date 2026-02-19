import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { PaymentAccounts } from '../database/schemas'
import { encrypt, decrypt } from '../utils/crypto'

const BLINK_METHOD = 'blink'

function isBlinkPayload(data: any): boolean {
  return data?.payment_method === BLINK_METHOD
}

export async function createPaymentAccount(data: any) {
  if (!data) {
    throw new Error('Datos requeridos para crear la cuenta de pago.')
  }

  const {
    user_id,
    bank_name,
    account_type,
    account_number,
    holder_name,
    email,
    payment_method,
    blink_wallet_address,
  } = data

  if (isBlinkPayload(data)) {
    if (!blink_wallet_address?.trim()) {
      throw new Error('Para método Blink es obligatoria la dirección Blink / Lightning (blink_wallet_address).')
    }
    // Opcional: evitar duplicar misma dirección Blink para el mismo usuario
    const existingBlink = await db
      .select()
      .from(PaymentAccounts)
      .where(eq(PaymentAccounts.user_id, user_id))
    const sameBlink = existingBlink.find(
      (a) => a.blink_wallet_address && decrypt(a.blink_wallet_address) === blink_wallet_address.trim(),
    )
    if (sameBlink) {
      throw new Error('Esta dirección Blink ya está registrada para tu cuenta.')
    }
    await db
      .insert(PaymentAccounts)
      .values({
        user_id,
        payment_method: encrypt(payment_method),
        blink_wallet_address: encrypt(blink_wallet_address.trim()),
        email: email?.trim() ? encrypt(email.trim()) : null,
        bank_name: null,
        account_type: null,
        account_number: null,
        holder_name: null,
      })
      .returning()
    return { message: 'Cuenta Blink creada exitosamente.' }
  }

  if (!bank_name?.trim() || !account_type?.trim() || !account_number?.trim() || !holder_name?.trim() || !email?.trim()) {
    throw new Error('Para métodos distintos de Blink son obligatorios: bank_name, account_type, account_number, holder_name, email.')
  }

  const existing = await db
    .select()
    .from(PaymentAccounts)
    .where(eq(PaymentAccounts.account_number, encrypt(account_number)))

  if (existing.length > 0) {
    throw new Error('Esta cuenta ya está registrada.')
  }

  await db
    .insert(PaymentAccounts)
    .values({
      user_id,
      bank_name: encrypt(bank_name),
      account_type: encrypt(account_type),
      account_number: encrypt(account_number),
      holder_name: encrypt(holder_name),
      email: encrypt(email),
      payment_method: encrypt(payment_method),
      blink_wallet_address: null,
    })
    .returning()

  return { message: 'Cuenta creada exitosamente.' }
}

export async function getPaymentAccountsByUser(userId: string) {
  if (!userId) {
    throw new Error('ID de usuario requerido.')
  }

  const accounts = await db
    .select()
    .from(PaymentAccounts)
    .where(eq(PaymentAccounts.user_id, userId))

  // Desencriptar los valores de las cuentas
  const decryptedAccounts = accounts.map((account) => ({
    ...account,
    bank_name: account.bank_name ? decrypt(account.bank_name) : null,
    account_type: account.account_type ? decrypt(account.account_type) : null,
    account_number: account.account_number ? decrypt(account.account_number) : null,
    holder_name: account.holder_name ? decrypt(account.holder_name) : null,
    email: account.email ? decrypt(account.email) : null,
    payment_method: decrypt(account.payment_method),
    blink_wallet_address: account.blink_wallet_address ? decrypt(account.blink_wallet_address) : null,
  }))

  return decryptedAccounts
}

export async function deletePaymentAccount(accountId: string, userId: string) {
  if (!accountId || !userId) {
    throw new Error('ID de cuenta o usuario inválido.')
  }

  const account = await db
    .select()
    .from(PaymentAccounts)
    .where(eq(PaymentAccounts.id, accountId))

  if (!account.length) {
    throw new Error('Cuenta de pago no encontrada.')
  }

  if (account[0].user_id !== userId) {
    throw new Error('No autorizado para eliminar esta cuenta.')
  }

  await db.delete(PaymentAccounts).where(eq(PaymentAccounts.id, accountId))

  return { message: 'Cuenta eliminada exitosamente.' }
}

export async function updatePaymentAccount(accountId: string, data: any) {
  if (!accountId) {
    throw new Error('ID de cuenta requerido.')
  }

  const account = await db
    .select()
    .from(PaymentAccounts)
    .where(eq(PaymentAccounts.id, accountId))

  if (!account.length) {
    throw new Error('Cuenta de pago no encontrada.')
  }

  const current = account[0]
  const decryptedMethod = decrypt(current.payment_method)
  const isBlink = data.payment_method === BLINK_METHOD || decryptedMethod === BLINK_METHOD

  const updateData: Record<string, any> = {
    payment_method: encrypt(data.payment_method ?? decryptedMethod),
  }

  if (isBlink) {
    updateData.blink_wallet_address = data.blink_wallet_address != null
      ? encrypt(String(data.blink_wallet_address).trim())
      : (current.blink_wallet_address ?? null)
    updateData.email = data.email != null && String(data.email).trim()
      ? encrypt(String(data.email).trim())
      : (current.email ?? null)
    updateData.bank_name = null
    updateData.account_type = null
    updateData.account_number = null
    updateData.holder_name = null
  } else {
    updateData.bank_name = encrypt(data.bank_name ?? (current.bank_name ? decrypt(current.bank_name) : ''))
    updateData.account_type = encrypt(data.account_type ?? (current.account_type ? decrypt(current.account_type) : ''))
    updateData.account_number = encrypt(data.account_number ?? (current.account_number ? decrypt(current.account_number) : ''))
    updateData.holder_name = encrypt(data.holder_name ?? (current.holder_name ? decrypt(current.holder_name) : ''))
    updateData.email = encrypt(data.email ?? (current.email ? decrypt(current.email) : ''))
    updateData.blink_wallet_address = null
  }

  await db
    .update(PaymentAccounts)
    .set(updateData)
    .where(eq(PaymentAccounts.id, accountId))

  return { message: 'Cuenta de pago actualizada exitosamente.' }
}
