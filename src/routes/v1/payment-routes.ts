import { Router } from 'express'
import { handleCreate3DSTransaction } from '../../controllers/payment-3ds-controller'
import { handleCreateBlinkTransaction } from '../../controllers/payment-blink-controller'

const wompiRouter = Router()

wompiRouter.post('/TransaccionCompra/3DS', handleCreate3DSTransaction)
wompiRouter.post('/TransaccionCompra/blink', handleCreateBlinkTransaction)

export default wompiRouter
