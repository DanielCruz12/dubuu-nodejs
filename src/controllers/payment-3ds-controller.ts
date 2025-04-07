// controllers/payment-controller.ts
import { Request, Response } from 'express'
import { createTransaction3DS } from '../services/payment-3ds-service'
import { createBookingService } from '../services/booking-service'

const API_URL = process.env.API_URL

export const handleCreate3DSTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      cardNumber,
      cardExpiry,
      cardCvc,
      total,
      user_id,
      product_id,
      tickets,
      paymentMethod,
    } = req.body

    if (
      !cardExpiry ||
      typeof cardExpiry !== 'string' ||
      !cardExpiry.includes('/')
    ) {
      return res.status(400).json({
        message: 'Formato de fecha de expiración inválido. Esperado MM/YY',
      })
    }

    // Separar mes/año de expiración
    const [monthStr, yearStr] = cardExpiry.split('/')
    const mesVencimiento = parseInt(monthStr)
    const anioVencimiento = 2000 + parseInt(yearStr) // "29" => 2029

    const payload = {
      tarjetaCreditoDebido: {
        numeroTarjeta: cardNumber.replace(/\s/g, ''),
        cvv: cardCvc,
        mesVencimiento,
        anioVencimiento,
      },
      monto: total,
      configuracion: {
        emailsNotificacion: 'dubondanielcruz@gmail.com',
        urlWebhook: `${API_URL}/webhook-wompi`,
        telefonosNotificacion: '77886116',
        notificarTransaccionCliente: true,
      },
      urlRedirect: 'https://dantour.vercel.app/',
      nombre: firstName,
      apellido: lastName,
      email,
      ciudad: city,
      direccion: address,
      idPais: country,
      idRegion: state,
      codigoPostal: zipCode,
      telefono: '77886116',
    }

    const result = await createTransaction3DS(payload)

    if (!result || !result.idTransaccion || !result.urlCompletarPago3Ds) {
      return res.status(502).json({
        message: 'Error al procesar el pago. Intenta de nuevo o usa otra tarjeta.',
      });
    }

    const bookingPayload = {
      user_id,
      product_id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      id_region: state,
      country,
      zip_code: zipCode,
      tickets: tickets || 1,
      total,
      paymentMethod,
      idTransaccion: result.idTransaccion,
      urlCompletarPago3Ds: result.urlCompletarPago3Ds,
    }

    await createBookingService(bookingPayload)

    return res.status(200).json(result)
  } catch (error: any) {
    console.error("Error en createTransaction3DS:", error);

    const mensajes = error?.mensajes || error?.response?.data?.mensajes;
  
    return res.status(400).json({
      message: mensajes?.[0] || error.message || "Error al crear transacción 3DS",
    });
  }
}
