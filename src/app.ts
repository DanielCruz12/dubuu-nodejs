import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'

dotenv.config()

//* Create an Express application
const app = express()

//* Middleware to parse JSON bodies
app.use(cors())

app.use(express.json())

setupSwagger(app)

app.post('/api/enlacePago', async (req, res) => {
  try {
    // Realiza la petición a la API de Wompi
    const response = await fetch('https://api.wompi.sv/EnlacePago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WOMPI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    // Envía la respuesta al cliente
    res.json(data)
  } catch (error) {
    console.error('Error en la solicitud de pago:', error)
    res.status(500).json({ error: 'Error en la solicitud' })
  }
})

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
