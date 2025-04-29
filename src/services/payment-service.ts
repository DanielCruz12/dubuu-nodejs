import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { PaymentAccounts } from '../database/schemas'
import { encrypt, decrypt } from '../utils/crypto'

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
  } = data

  const existing = await db
    .select()
    .from(PaymentAccounts)
    .where(eq(PaymentAccounts.account_number, account_number))

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
    bank_name: decrypt(account.bank_name),
    account_type: decrypt(account.account_type),
    account_number: decrypt(account.account_number),
    holder_name: decrypt(account.holder_name),
    email: decrypt(account.email),
    payment_method: decrypt(account.payment_method),
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

  const updateData = {
    bank_name: encrypt(data.bank_name ?? decrypt(account[0].bank_name)),
    account_type: encrypt(data.account_type ?? decrypt(account[0].account_type)),
    account_number: encrypt(data.account_number ?? decrypt(account[0].account_number)),
    holder_name: encrypt(data.holder_name ?? decrypt(account[0].holder_name)),
    email: encrypt(data.email ?? decrypt(account[0].email)),
    payment_method: encrypt(data.payment_method ?? decrypt(account[0].payment_method)),
  }

  await db
    .update(PaymentAccounts)
    .set(updateData)
    .where(eq(PaymentAccounts.id, accountId))

  return { message: 'Cuenta de pago actualizada exitosamente.' }
}
