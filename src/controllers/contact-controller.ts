// src/controllers/contact-controller.ts
import { Request, Response } from 'express'
import { sendContactEmail } from '../services/contact-service'

export const handleContactForm = async (req: Request, res: Response) => {
  const data = req.body

  if (
    !data.nombre ||
    !data.email ||
    !data.mensaje ||
    !data.terminosCondiciones
  ) {
    return res.status(400).json({ message: 'Campos obligatorios faltantes.' })
  }

  try {
    await sendContactEmail(data)
    res.status(200).json({ message: 'Mensaje enviado correctamente.' })
  } catch (error) {
    console.error('Error al enviar el correo:', error)
    res.status(500).json({ message: 'Error al enviar el mensaje.' })
  }
}
