import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Faqs } from '../database/schemas'

// Obtiene todas las FAQs
export const getFaqsService = async () => {
  return await db.select().from(Faqs).execute()
}

export const getFaqsByProductIdService = async (productId: string) => {
  const faqs = await db
    .select()
    .from(Faqs)
    .where(eq(Faqs.product_id, productId))
    .execute()

  return faqs
}

// Obtiene una FAQ por ID
export const getFaqByIdService = async (faqId: string) => {
  const [faq] = await db
    .select()
    .from(Faqs)
    .where(eq(Faqs.id, faqId))
    .limit(1)
    .execute()
  return faq || null
}

// Crea una nueva FAQ
export const createFaqService = async (data: any) => {
  try {
    const [newFaq] = await db.insert(Faqs).values(data).returning()
    return newFaq
  } catch (error) {
    console.error('Error creating FAQ:', error)
    throw new Error('Failed to create FAQ')
  }
}

// Actualiza una FAQ existente
export const updateFaqService = async (faqId: string, data: any) => {
  try {
    const [updatedFaq] = await db
      .update(Faqs)
      .set(data)
      .where(eq(Faqs.id, faqId))
      .returning()
    return updatedFaq
  } catch (error) {
    console.error('Error updating FAQ:', error)
    throw new Error('Failed to update FAQ')
  }
}

// Elimina una FAQ por ID
export const deleteFaqService = async (faqId: string) => {
  try {
    const [deletedFaq] = await db
      .delete(Faqs)
      .where(eq(Faqs.id, faqId))
      .returning()
    return deletedFaq
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    throw new Error('Failed to delete FAQ')
  }
}
