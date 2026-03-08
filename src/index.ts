import http from 'http'
import app from './app'
import { initSocket } from './socket'

const port = process.env.PORT || 3002

async function main() {
  try {
    console.log('✅ Database connected')
    const httpServer = http.createServer(app)
    initSocket(httpServer)
    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`)
      console.log(`🔌 Socket.IO disponible en /socket.io`)
    })
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
  }
}

main()
