// src/services/notification-service.ts
import { admin } from "../firebase-admin";

type SendNotificationOptions = {
  token: string;
  title: string;
  body: string;
  link?: string; // URL opcional a abrir en el click
};

export async function sendPushNotification({
  token,
  title,
  body,
  link,
}: SendNotificationOptions) {
  const payload: admin.messaging.Message = {
    token,
    notification: {
      title,
      body,
    },
    webpush: link
      ? {
          fcmOptions: {
            link,
          },
        }
      : undefined,
  };

  try {
    const res = await admin.messaging().send(payload);
    return { success: true, messageId: res };
  } catch (error) {
    console.error("Error sending FCM message", error);
    return { success: false, error };
  }
}