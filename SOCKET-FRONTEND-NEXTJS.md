# Socket.IO en Next.js (frontend)

El **backend** (Node.js, repo aparte) ya tiene Socket.IO. Este doc es solo para el **cliente** en Next.js.

Referencia: [Socket.IO – How to use with Next.js](https://socket.io/es/how-to/use-with-nextjs).

---

## 1. Instalar

```bash
pnpm install socket.io-client
```

---

## 2. Rewrite en Next.js (backend no expuesto)

Tu `next.config` ya reescribe `/backend/:path*` → `BACKEND_URL/:path*`. Así el navegador solo habla con tu dominio; Next envía la petición al backend. El cliente debe usar **mismo origen** y path **`/backend/socket.io`**.

---

## 3. Crear el cliente (evitar SSR)

Socket.IO debe ejecutarse solo en el navegador. Un solo archivo:

**`src/lib/socket.ts`** (o `src/socket.ts`):

```ts
'use client'

import { io, Socket } from 'socket.io-client'

// Mismo origen: el navegador pide a tu sitio /backend/socket.io
// Next rewrites a BACKEND_URL/socket.io (el backend no queda expuesto)
const socketOptions = {
  path: '/backend/socket.io',
  transports: ['websocket'] as const,
}

export const socket: Socket =
  typeof window !== 'undefined'
    ? io('', socketOptions)
    : ({} as Socket)
```

- **URL `''`**: mismo origen (ej. `https://www.dubuu.com` o `http://localhost:3000`). Las peticiones van a tu Next, que hace el rewrite.
- **Path `/backend/socket.io`**: coincide con tu `source: "/backend/:path*"`; el backend sigue escuchando en `/socket.io`.
- **Socket solo en el cliente**: en SSR `socket` es un objeto vacío; en la página solo usas `socket.on`/`emit` dentro de `useEffect`, que corre en el cliente.

---

## 4. Usar en la página

Conectar, unirse a la sala con `userId` y escuchar `payment:completed`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { socket } from '@/lib/socket'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return

    function onConnect() {
      socket.emit('join', { userId: user.id })
    }

    function onPaymentCompleted(data: { bookingId: string; status: string }) {
      toast.success('Pago confirmado')
      router.push('/mis-reservas')
    }

    if (socket.connected) onConnect()

    socket.on('connect', onConnect)
    socket.on('payment:completed', onPaymentCompleted)

    return () => {
      socket.off('connect', onConnect)
      socket.off('payment:completed', onPaymentCompleted)
    }
  }, [user?.id, router])

  return (/* tu UI */)
}
```

- **`userId`**: el mismo que usas en el backend (ej. Clerk `user.id`).
- El backend une el socket a la sala `user:{userId}` y emite `payment:completed` cuando el webhook confirma el pago.

---

## 5. Comprobar transporte (opcional)

Para ver si va por WebSocket (como en la [doc oficial](https://socket.io/es/how-to/use-with-nextjs)):

```ts
const [transport, setTransport] = useState('N/A')

useEffect(() => {
  function onConnect() {
    setTransport(socket.io.engine.transport.name) // "websocket" o "polling"
  }
  socket.on('connect', onConnect)
  return () => socket.off('connect', onConnect)
}, [])

// En el JSX: <p>Transport: { transport }</p>
```

Con `transports: ['websocket']` deberías ver **websocket**.

---

## 6. Variables de entorno

Para el **rewrite** solo necesitas en Next.js (servidor, no tiene que ser pública):

```env
BACKEND_URL=https://dubuu-dev-nodeapi.online
```

En local: `BACKEND_URL=http://localhost:3002`. El socket no usa `NEXT_PUBLIC_*`: el cliente conecta a mismo origen y el rewrite usa `BACKEND_URL` en el servidor.

---

## Resumen

| Qué | Valor |
|-----|--------|
| URL del socket | `''` (mismo origen: tu dominio o localhost:3000) |
| Path | `/backend/socket.io` (rewrite → backend `/socket.io`) |
| Solo WebSocket | `transports: ['websocket']` |
| Evitar SSR | `typeof window !== 'undefined'` para crear `io()` solo en el cliente |
| Eventos | `join` con `{ userId }` al conectar; `payment:completed` para toast/redirect |

El backend (repo aparte) escucha en `/socket.io`. Next recibe en `/backend/socket.io` y reescribe a `BACKEND_URL/socket.io`.
