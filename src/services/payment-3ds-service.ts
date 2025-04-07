// services/wompi.service.ts
import axios from 'axios'

const WOMPI_API_URL = process.env.WOMPI_URL
const WOMPI_SECRET = process.env.WOMPI_CLIENT_SECRET || 'TU_API_SECRET'

export const createTransaction3DS = async (payload: any) => {
  try {
    const response = await axios.post(
      `${WOMPI_API_URL}/TransaccionCompra/3DS`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WOMPI_SECRET}`,
        },
      },
    )

    return response
  } catch (error: any) {
    console.error(
      'Error en createTransaction3DS:',
      error?.response?.data || error?.message,
    )
  }
}
