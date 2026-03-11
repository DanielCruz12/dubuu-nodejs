import { Router } from 'express'
import { requireAuth } from '@clerk/express'
import { handleCreate3DSTransaction } from '../../controllers/payment-3ds-controller'
import { handleWompiWebhook } from '../../controllers/wompi-webhook-controller'

const wompiRouter = Router()

wompiRouter.post('/TransaccionCompra/3DS', requireAuth(), handleCreate3DSTransaction)
wompiRouter.post('/webhook-wompi', handleWompiWebhook)

export default wompiRouter
