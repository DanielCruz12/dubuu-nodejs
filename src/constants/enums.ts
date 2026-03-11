/**
 * Enums globales para métodos de pago y estados de reserva.
 * Usar estas constantes en lugar de strings literales para evitar typos y centralizar valores.
 */

/** Método de pago (Blink, Wompi, etc.) */
export const PaymentMethod = {
  BLINK: 'blink',
  WOMPI: 'wompi',
  BANK: 'bank',
  PAYPAL: 'paypal',
} as const

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod]

/** Estado de una reserva (booking) */
export const BookingStatus = {
  IN_PROCESS: 'in-process',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
} as const

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus]
