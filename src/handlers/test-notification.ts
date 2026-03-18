// src/handlers/test-notification.ts
import { Request, Response } from 'express'
import { sendPushNotification } from '../services/notification-service'

export async function testNotificationHandler(req: Request, res: Response) {
  const { token, title, body, link } = req.body

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: 'token is required' })
  }

  const result = await sendPushNotification({
    token,
    title: title ?? 'Test notification',
    body: body ?? 'Hola, esto es una prueba desde el backend',
    link,
  })

  if (result.success) {
    return res.json({ success: true, messageId: result.messageId })
  }

  return res.status(500).json({ success: false, error: result.error })
}
