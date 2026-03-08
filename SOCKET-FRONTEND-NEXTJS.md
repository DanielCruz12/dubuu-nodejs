# Socket.IO – Guía para el frontend (Next.js)

## Resumen

Cuando el usuario paga (Wompi o Blink), el backend recibe el webhook, actualiza el booking a `completed` y emite por Socket.IO el evento `payment:completed` a la sala del usuario. El frontend debe conectarse, unirse a esa sala con el `userId` (ej. Clerk) y reaccionar al evento (toast, redirección a “Mis reservas”, etc.).

---

## 1. Instalación en Next.js

```bash
npm install socket.io-client
```

---

## 2. URL del backend

Socket.IO se sirve en el **mismo host y puerto** que tu API. Ejemplo:

- API: `http://localhost:3002`
- Socket: `http://localhost:3002` (mismo origen; el path es `/socket.io` por defecto)

En producción usa tu URL de API, ej: `https://api.tudominio.com`.

---

## 3. Conectar y unirse a la sala del usuario

El backend espera que el cliente emita el evento **`join`** con **`userId`** (el mismo que usas en el backend para `user_id` en bookings, ej. Clerk `user.id`). Así el servidor te pone en la sala `user:{userId}` y te enviará ahí `payment:completed`.

Ejemplo de hook en Next.js (cliente):

```ts
// hooks/usePaymentSocket.ts
'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export function usePaymentSocket(userId: string | null, onPaymentCompleted: (data: { bookingId: string; status: string }) => void) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    const socket = io(SOCKET_URL, { path: '/socket.io', autoConnect: true })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join', { userId })
    })

    socket.on('payment:completed', onPaymentCompleted)

    return () => {
      socket.off('payment:completed')
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId, onPaymentCompleted])

  return socketRef.current
}
```

Uso en una página (ej. después de crear el booking / ir a pagar):

```tsx
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { usePaymentSocket } from '@/hooks/usePaymentSocket'
import { toast } from 'sonner' // o tu librería de toasts

export default function CheckoutPage() {
  const { user } = useUser()
  const router = useRouter()

  const handlePaymentCompleted = useCallback(
    (data: { bookingId: string; status: string }) => {
      toast.success('Pago confirmado')
      router.push('/mis-reservas') // o la ruta que prefieras
    },
    [router],
  )

  usePaymentSocket(user?.id ?? null, handlePaymentCompleted)

  return (
    // ... tu UI de checkout
  )
}
```

- **userId**: mismo que envías al backend al crear el booking (ej. `user.id` de Clerk).
- **onPaymentCompleted**: se ejecuta cuando el webhook de Wompi/Blink ya procesó el pago y el backend emitió `payment:completed`.

---

## 4. Cómo saber que ya funciona

1. **Conexión**: en el hook, tras `socket.on('connect', ...)` puedes hacer `console.log('Socket connected')` o mostrar un indicador en UI.
2. **Join**: el backend no devuelve nada al emitir `join`; con estar conectado y emitir `join` con `userId` es suficiente.
3. **Pago real**: crea un booking, paga con Wompi o Blink y deja que el webhook se dispare. En el cliente debería ejecutarse `onPaymentCompleted` (toast + redirección).
4. **Prueba rápida desde el backend**: en algún endpoint o script, puedes hacer:
   ```ts
   getIO().to(getUserRoom('TU_USER_ID')).emit('payment:completed', { bookingId: '...', status: 'completed' })
   ```
   y comprobar que el front recibe el evento.

---

## 5. Variables de entorno (recomendado)

En el backend (`.env`):

```env
FRONTEND_URL=http://localhost:3000
```

En producción pon la URL de tu front (ej. `https://tudominio.com`) para CORS de Socket.IO.

En el frontend (`.env.local`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

En producción la URL de tu API.

---

## 6. Resumen de flujo

| Paso | Quién | Qué pasa |
|------|--------|----------|
| 1 | Frontend | Usuario inicia pago → llamas al endpoint de crear booking (status `in-process`). |
| 2 | Frontend | Usuario paga en Wompi/Blink; la página sigue abierta y el socket está conectado y con `join(userId)`. |
| 3 | Backend | Wompi/Blink envían webhook → backend actualiza booking a `completed` y emite `payment:completed` a `user:{userId}`. |
| 4 | Frontend | El cliente recibe `payment:completed` → toast “Pago confirmado” y/o redirección a “Mis reservas”. |

No necesitas polling: con este flujo el backend “empuja” el evento al frontend en cuanto el webhook confirma el pago.
