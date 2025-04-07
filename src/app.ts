import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import bodyParser from 'body-parser'
import wompiRouter from './routes/v1/payment-routes'
import { handleWebHook } from './controllers/clerk-webhook-controller'
import crypto from 'crypto'
import express, { Request, Response } from 'express'

dotenv.config()

//* Create an Express application
const app = express()

// const allowedOrigin = process.env.FRONTEND_URL
// app.use(
//   cors({
//     origin: allowedOrigin,
//   }),
// )
//* Middleware to parse JSON bodies
app.use(cors())
app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  handleWebHook,
)

const WOMPI_SECRET = process.env.WOMPI_CLIENT_SECRET || 'TU_API_SECRET'

app.use(
  bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      ;(req as any).rawBody = buf.toString()
    },
  }),
)

// Webhook handler
app.post('/webhook-wompi', (req: Request, res: Response) => {
  const rawBody = (req as any).rawBody // o usa el tipo extendido si ya definiste rawBody correctamente
  const wompiHashHeader = req.headers['wompi_hash']

  if (!wompiHashHeader || typeof wompiHashHeader !== 'string') {
    return res.status(400).send('Falta o es inválido el header wompi_hash')
  }

  const hmac = crypto.createHmac('sha256', WOMPI_SECRET)
  hmac.update(rawBody)
  const calculatedHash = hmac.digest('hex')

  if (calculatedHash !== wompiHashHeader) {
    console.log('Webhook inválido: hash no coincide')
    return res.status(403).send('☠️❌❌Hash inválido')
  }

  const webhookData = req.body
  console.log('✅ Webhook verificado:', webhookData)
  //! cambiar estado al booking (pagado)

  // Aquí puedes manejar los datos del webhook (verificar estado, guardar en DB, etc.)
  res.sendStatus(200)
})

setupSwagger(app)
app.use(express.json())

app.use('/api/v1', wompiRouter)

//* Define routes
app.use('/api/v1', apiRoutes)

//* Fallback route for undefined endpoints
app.use('/api/v1', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(express.static('public'))

//* Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

export default app
