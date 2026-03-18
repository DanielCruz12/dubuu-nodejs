export const PaymentMethod = {
  BLINK: 'blink',
  WOMPI: 'wompi',
} as const

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod]

/** Estado de una reserva (booking) */
export const BookingStatus = {
  IN_PROCESS: 'in-process',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  PROCESSING: 'processing',
} as const

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus]
