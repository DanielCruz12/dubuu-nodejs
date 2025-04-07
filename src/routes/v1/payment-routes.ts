import { Router } from 'express'
import { handleCreate3DSTransaction } from '../../controllers/payment-3ds-controller'

const wompiRouter = Router()

// POST /api/v1/wompi/enlacePago
// wompiRouter.post('/enlacePago', createEnlacePago)

wompiRouter.post('/TransaccionCompra/3DS', handleCreate3DSTransaction)

export default wompiRouter
