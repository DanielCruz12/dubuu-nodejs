import type { TourDateStatusType } from '../constants'

/** Una fila al crear el tour: solo fecha ISO o fecha + precio/cupo por fila */
export type TourDateCreateInput =
  | string
  | {
      date: string
      price?: number | string
      max_people?: number | string
      status?: TourDateStatusType
    }

export type TourDateRow = {
  id: string
  date: Date
  max_people: number
  people_booked: number
  price: string
  status: TourDateStatusType
}
