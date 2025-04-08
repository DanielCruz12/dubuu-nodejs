import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import wompiRouter from './routes/v1/payment-routes'
import express, { Request, Response } from 'express'
import { handleWebHook } from './controllers/clerk-webhook-controller'
import { handleWompiWebhook } from './controllers/wompi-webhook-controller'

dotenv.config()
const app = express()

app.use(cors())
app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  handleWebHook,
)

app.use(
  bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      ;(req as any).rawBody = buf.toString()
    },
  }),
)

app.post('/webhook-wompi', handleWompiWebhook)

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
