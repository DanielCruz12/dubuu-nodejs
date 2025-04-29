import express from 'express'
import {
  createPaymentAccountController,
  getPaymentAccountsByUserController,
  deletePaymentAccountController,
  updatePaymentAccountController,
} from '../../controllers/payment-account-controller'

const router = express.Router()

router.post('/', createPaymentAccountController)
router.get('/user/:userId', getPaymentAccountsByUserController)
router.delete('/:userId/:accountId', deletePaymentAccountController)
router.put('/:userId/:accountId', updatePaymentAccountController)

export { router as paymentAccountRoutes }
