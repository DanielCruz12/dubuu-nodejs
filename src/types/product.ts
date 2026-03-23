import type { TourDateStatusType } from '../constants'

/** Body PATCH /products/:id — campos de producto + opciones de fechas de tour */
export type UpdateProductBody = {
  user_id: string
  name?: string
  description?: string
  address?: string
  country?: string
  locale?: string
  /** Tour: actualizar solo esta fecha (mutuamente excluyente con update_all_tour_dates) */
  selectedDateId?: string
  /** Tour: aplicar price / max_people / status a todas las fechas del tour */
  update_all_tour_dates?: boolean
  price?: string | number
  max_people?: number
  status?: TourDateStatusType
}
