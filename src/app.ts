import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors, { CorsOptions } from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import express, { NextFunction, Request, Response } from 'express'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import wompiRouter from './routes/v1/payment-routes'
import blinkRouter from './routes/v1/blink-routes'
import { clerkMiddleware } from '@clerk/express'
import { handleClerkWebHook } from './controllers/clerk-webhook-controller'

dotenv.config()

const app = express()

app.disable('x-powered-by')

// Si estás detrás de un proxy/load balancer (Heroku, Render, Cloudflare, etc.)
app.set('trust proxy', 1)

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(hpp())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máx. 100 peticiones por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

// Clerk debe ir antes de cualquier ruta que use getAuth o requireAuth
app.use(clerkMiddleware())

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json', limit: '1mb' }),
  handleClerkWebHook,
)

app.use(
  bodyParser.json({
    limit: '1mb',
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

// Manejo genérico de errores para no filtrar detalles internos en producción
// Debe ir después de todas las rutas y middlewares
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const status = err.status || err.statusCode || 500
  const isProd = process.env.NODE_ENV === 'production'

  const message =
    status === 500 && isProd ? 'Internal server error' : err.message || 'Unexpected error'

  res.status(status).json({
    message,
  })
})

app.use(express.static('public'))

//* Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

export default app
