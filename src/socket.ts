import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'

const USER_ROOM_PREFIX = 'user:'

let io: Server | null = null

/**
 * Inicializa Socket.IO sobre el servidor HTTP.
 * El cliente debe emitir 'join' con { userId } para unirse a su sala y recibir eventos de pago.
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  })

  io.on('connection', (socket: Socket) => {
    socket.on('join', (payload: { userId?: string }) => {
      const userId = payload?.userId
      if (userId) {
        socket.join(`${USER_ROOM_PREFIX}${userId}`)
      }
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO no inicializado. Llama initSocket(server) en index.ts')
  return io
}

export function getUserRoom(userId: string): string {
  return `${USER_ROOM_PREFIX}${userId}`
}
