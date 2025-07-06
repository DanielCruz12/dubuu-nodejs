import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/:base', async (req, res) => {
  const { base } = req.params

  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${base}`,
    )

    res.json(response.data)
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    res.status(500).json({ error: 'Failed to fetch exchange rates' })
  }
})

export { router as exchangeRoutes }
