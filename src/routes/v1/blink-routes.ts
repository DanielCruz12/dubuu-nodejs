import { Router } from 'express'
import { requireAuth } from '@clerk/express'
import { handleCreateBlinkTransaction } from '../../controllers/payment-blink-controller'
import { handleBlinkWebhook } from '../../controllers/blink-webhook-controller'

const blinkRouter = Router()

blinkRouter.post('/TransaccionCompra/blink', requireAuth(), handleCreateBlinkTransaction)
blinkRouter.post('/webhook-blink', handleBlinkWebhook)

export default blinkRouter
