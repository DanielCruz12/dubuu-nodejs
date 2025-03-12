import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/v1'
import { setupSwagger } from './swagger'
import { clerkClient, getAuth, requireAuth } from '@clerk/express'

dotenv.config()

//* Create an Express application
const app = express()

//* Middleware to parse JSON bodies
app.use(cors())

app.use(express.json())

setupSwagger(app)

app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId!)

  return res.json({ user })
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
