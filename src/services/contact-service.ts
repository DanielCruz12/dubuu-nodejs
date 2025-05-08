// src/services/contact-service.ts
import nodemailer from 'nodemailer'

type ContactFormData = {
  nombre: string
  apellido: string
  email: string
  telefono: string
  tipoServicio: string
  mensaje: string
  terminosCondiciones: boolean
}

export const sendContactEmail = async (data: ContactFormData) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'team@lappsnet.com',
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const htmlContent = `
    <div style="font-family: Arial; background-color: #000; color: #fff; padding: 2rem;">
      <h2 style="text-align:center; color: #fff;">Nuevo mensaje desde Dubuu</h2>
      <p><strong>Nombre:</strong> ${data.nombre} ${data.apellido}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.telefono}</p>
      <p><strong>Tipo de servicio:</strong> ${data.tipoServicio}</p>
      <p><strong>Mensaje:</strong></p>
      <p style="background:#111;padding:1rem;">${data.mensaje}</p>
      <hr />
      <p style="font-size:0.8rem; color: #aaa;">
        El usuario aceptó los 
        <a href="https://www.dubuu.com/terms" style="color: #fff;">Términos</a> y 
        <a href="https://www.dubuu.com/privacy" style="color: #fff;">Privacidad</a>.
      </p>
    </div>
  `

  return transporter.sendMail({
    from: '"Dubuu Contacto" <team@lappsnet.com>',
    to: 'team@lappsnet.com',
    subject: `📬 Nuevo mensaje de ${data.nombre}`,
    replyTo: data.email,
    html: htmlContent,
  })
}
