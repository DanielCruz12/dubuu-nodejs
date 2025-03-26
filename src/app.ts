import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import bodyParser from 'body-parser'
import wompiRouter from './routes/v1/payment-routes'
import { handleWebHook } from './controllers/clerk-webhook-controller'

dotenv.config()

//* Create an Express application
const app = express()

//* Middleware to parse JSON bodies
app.use(cors())

app.use(express.json())

setupSwagger(app)

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  handleWebHook,
)

app.use('/api', wompiRouter)

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
