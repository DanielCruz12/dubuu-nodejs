import { Request, Response } from 'express'
import { getWompiToken } from '../services/wompi-service'

export async function createEnlacePago(req: Request, res: Response) {
  try {
    const token = await getWompiToken()

    const response = await fetch('https://api.wompi.sv/EnlacePago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    })

    // 3. Retornamos la respuesta tal cual
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error en la solicitud de pago:', error)
    res.status(500).json({ error: 'Error en la solicitud' })
  }
}
