import express from 'express'
import {
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  getFaqsByProductId,
} from '../../controllers/faq-controller'

const router = express.Router()

router.get('/', getFaqs) // GET /faqs -> Lista todas las FAQs
router.get('/:id', getFaqById) // GET /faqs/:id -> Obtiene una FAQ por ID
router.get('/:productId', getFaqsByProductId) // GET /faqs/:id -> Obtiene una FAQ por ID
router.post('/', createFaq) // POST /faqs -> Crea una nueva FAQ
router.put('/:id', updateFaq) // PUT /faqs/:id -> Actualiza una FAQ existente
router.delete('/:id', deleteFaq) // DELETE /faqs/:id -> Elimina una FAQ por ID

export { router as faqsRoutes }
