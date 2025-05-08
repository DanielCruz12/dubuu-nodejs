// src/routes/v1/contact-routes.ts
import express from 'express'
import { handleContactForm } from '../../controllers/contact-controller'

const router = express.Router()

router.post('/', handleContactForm)

export { router as contactRoutes }
