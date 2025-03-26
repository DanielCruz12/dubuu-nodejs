import { Router } from 'express'
import { createEnlacePago } from '../../controllers/payment-controller'

const wompiRouter = Router()

// POST /api/v1/wompi/enlacePago
wompiRouter.post('/enlacePago', createEnlacePago)

export default wompiRouter
