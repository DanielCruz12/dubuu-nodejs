// services/wompi.service.ts
import axios from 'axios'
import { getWompiToken } from './wompi-service'

const WOMPI_API_URL = process.env.WOMPI_URL

export const createTransaction3DS = async (payload: any) => {
  const token = await getWompiToken()

  try {
    const response = await axios.post(
      `${WOMPI_API_URL}/TransaccionCompra/3DS`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  } catch (error: any) {
    console.error(
      'Error en createTransaction3DS:',
      error?.response?.data || error?.message,
    )
  }
}
