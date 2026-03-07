import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import wompiRouter from './routes/v1/payment-routes'
import blinkRouter from './routes/v1/blink-routes'
import express, { Request, Response } from 'express'
import { clerkMiddleware } from '@clerk/express'
import { handleClerkWebHook } from './controllers/clerk-webhook-controller'

dotenv.config()

const app = express()

// Clerk debe ir antes de cualquier ruta que use getAuth o requireAuth
app.use(clerkMiddleware())

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  handleClerkWebHook,
)

app.use(
  bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      ;(req as any).rawBody = buf.toString()
    },
  }),
)

setupSwagger(app)
app.use(express.json())

app.use('/api/v1', wompiRouter)
app.use('/api/v1', blinkRouter)

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
