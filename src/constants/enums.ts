export const PaymentMethod = {
  BLINK: 'blink',
  WOMPI: 'wompi',
} as const

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod]

/** Estado de una reserva (booking) */
export const BookingStatus = {
  ACTIVE: 'active',
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

/** Estado de una fecha concreta del tour (no del producto global) */
export const TourDateStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type TourDateStatusType =
  (typeof TourDateStatus)[keyof typeof TourDateStatus]
