import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Faqs } from '../database/schemas'
import { statusCodes } from '../utils'

// ✅ Obtener todas las FAQs
export const getFaqsService = async () => {
  try {
    const faqs = await db.select().from(Faqs).execute()
    return faqs
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las FAQs.')
  }
}

// ✅ Obtener FAQs por ID de producto
export const getFaqsByProductIdService = async (productId: string) => {
  if (!productId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del producto es obligatorio.')
  }

  try {
    const faqs = await db
      .select()
      .from(Faqs)
      .where(eq(Faqs.product_id, productId))
      .execute()

    return faqs
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener FAQs del producto.')
  }
}

// ✅ Obtener una FAQ por ID
export const getFaqByIdService = async (faqId: string) => {
  if (!faqId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la FAQ es obligatorio.')
  }

  try {
    const [faq] = await db
      .select()
      .from(Faqs)
      .where(eq(Faqs.id, faqId))
      .limit(1)
      .execute()

    return faq || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener la FAQ.')
  }
}

// ✅ Crear nueva FAQ
export const createFaqService = async (data: any) => {
  const { product_id, question, answer } = data

  if (!product_id || !question || !answer) {
    console.error('400:', statusCodes[400])
    throw new Error('Campos requeridos: product_id, question y answer.')
  }

  try {
    const [newFaq] = await db.insert(Faqs).values(data).returning()
    return newFaq
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear la FAQ.')
  }
}

// ✅ Actualizar una FAQ
export const updateFaqService = async (faqId: string, data: any) => {
  if (!faqId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la FAQ es obligatorio.')
  }

  try {
    const [updatedFaq] = await db
      .update(Faqs)
      .set(data)
      .where(eq(Faqs.id, faqId))
      .returning()

    if (!updatedFaq) {
      console.error('404:', statusCodes[404])
      throw new Error('FAQ no encontrada para actualizar.')
    }

    return updatedFaq
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar la FAQ.')
  }
}

// ✅ Eliminar una FAQ
export const deleteFaqService = async (faqId: string) => {
  if (!faqId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la FAQ es obligatorio para eliminar.')
  }

  try {
    const [deletedFaq] = await db
      .delete(Faqs)
      .where(eq(Faqs.id, faqId))
      .returning()

    if (!deletedFaq) {
      console.error('404:', statusCodes[404])
      throw new Error('FAQ no encontrada para eliminar.')
    }

    return deletedFaq
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar la FAQ.')
  }
}
