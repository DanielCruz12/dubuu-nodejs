import { Request, Response } from 'express'
import {
  getFaqsService,
  getFaqByIdService,
  createFaqService,
  updateFaqService,
  deleteFaqService,
  getFaqsByProductIdService,
} from '../services/faq-services'
import { statusCodes } from '../utils'

export const getFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await getFaqsService()
    res.status(200).json(faqs)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getFaqsByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const faqs = await getFaqsByProductIdService(productId)
    if (!faqs || faqs.length === 0) {
      return res.status(404).json({ message: 'No FAQs found for this product' })
    }
    res.status(200).json(faqs)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getFaqById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const faq = await getFaqByIdService(id)
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' })
    }
    res.status(200).json(faq)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createFaq = async (req: Request, res: Response) => {
  try {
    const newFaq = await createFaqService(req.body)
    res.status(201).json(newFaq)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedFaq = await updateFaqService(id, req.body)
    if (!updatedFaq) {
      return res.status(404).json({ message: 'FAQ not found' })
    }
    res.status(200).json(updatedFaq)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedFaq = await deleteFaqService(id)
    if (!deletedFaq) {
      return res.status(404).json({ message: 'FAQ not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
