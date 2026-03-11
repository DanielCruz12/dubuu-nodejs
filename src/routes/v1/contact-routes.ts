// src/routes/v1/contact-routes.ts
import express from 'express'
import { handleContactForm } from '../../controllers/contact-controller'
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.post('/', requireAuth(), handleContactForm)

export { router as contactRoutes }
