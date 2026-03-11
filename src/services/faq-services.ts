import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Faqs, FaqTranslations } from '../database/schemas'
import { statusCodes } from '../utils'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { saveFaqWithTranslations } from './faq-translations-service'

export const getFaqsService = async (locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  try {
    const rows = await db
      .select({
        id: Faqs.id,
        user_id: Faqs.user_id,
        product_id: Faqs.product_id,
        created_at: Faqs.created_at,
        updated_at: Faqs.updated_at,
        question: FaqTranslations.question,
        answer: FaqTranslations.answer,
      })
      .from(Faqs)
      .innerJoin(
        FaqTranslations,
        and(
          eq(Faqs.id, FaqTranslations.faq_id),
          eq(FaqTranslations.locale, lang),
        ),
      )
      .execute()
    return rows
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las FAQs.')
  }
}

export const getFaqsByProductIdService = async (
  productId: string,
  locale?: string,
) => {
  if (!productId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del producto es obligatorio.')
  }
  const lang = locale ?? getDefaultLocale()
  try {
    const rows = await db
      .select({
        id: Faqs.id,
        user_id: Faqs.user_id,
        product_id: Faqs.product_id,
        created_at: Faqs.created_at,
        updated_at: Faqs.updated_at,
        question: FaqTranslations.question,
        answer: FaqTranslations.answer,
      })
      .from(Faqs)
      .innerJoin(
        FaqTranslations,
        and(
          eq(Faqs.id, FaqTranslations.faq_id),
          eq(FaqTranslations.locale, lang),
        ),
      )
      .where(eq(Faqs.product_id, productId))
      .execute()
    return rows
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener FAQs del producto.')
  }
}

export const getFaqByIdService = async (faqId: string, locale?: string) => {
  if (!faqId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la FAQ es obligatorio.')
  }
  const lang = locale ?? getDefaultLocale()
  try {
    const [row] = await db
      .select({
        id: Faqs.id,
        user_id: Faqs.user_id,
        product_id: Faqs.product_id,
        created_at: Faqs.created_at,
        updated_at: Faqs.updated_at,
        question: FaqTranslations.question,
        answer: FaqTranslations.answer,
      })
      .from(Faqs)
      .innerJoin(
        FaqTranslations,
        and(
          eq(Faqs.id, FaqTranslations.faq_id),
          eq(FaqTranslations.locale, lang),
        ),
      )
      .where(eq(Faqs.id, faqId))
      .limit(1)
      .execute()
    return row || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener la FAQ.')
  }
}

export const createFaqService = async (data: any) => {
  const { product_id, question, answer, user_id, locale: requestedLocale } = data
  const enabled = getEnabledLocales()
  const locale =
    requestedLocale?.trim()?.toLowerCase() && enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined

  if (!product_id || !question || !answer || !user_id) {
    console.error('400:', statusCodes[400])
    throw new Error('Campos requeridos: product_id, user_id, question y answer.')
  }

  try {
    const [newFaq] = await db
      .insert(Faqs)
      .values({ product_id, user_id })
      .returning()
    if (!newFaq) throw new Error('Error al crear la FAQ.')

    await saveFaqWithTranslations(newFaq.id, { question, answer }, locale)
    const created = await getFaqByIdService(newFaq.id, locale)
    return created ?? newFaq
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear la FAQ.')
  }
}

export const updateFaqService = async (faqId: string, data: any) => {
  if (!faqId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la FAQ es obligatorio.')
  }

  const { question, answer, locale: requestedLocale } = data
  const enabled = getEnabledLocales()
  const locale =
    requestedLocale?.trim()?.toLowerCase() && enabled.includes(requestedLocale.trim().toLowerCase())
      ? requestedLocale.trim().toLowerCase()
      : undefined
  try {
    if (question !== undefined || answer !== undefined) {
      const defaultLocale = getDefaultLocale()
      const [currentTr] = await db
        .select({
          question: FaqTranslations.question,
          answer: FaqTranslations.answer,
        })
        .from(FaqTranslations)
        .where(
          and(
            eq(FaqTranslations.faq_id, faqId),
            eq(FaqTranslations.locale, defaultLocale),
          ),
        )
        .limit(1)
      await saveFaqWithTranslations(
        faqId,
        {
          question: question ?? currentTr?.question ?? '',
          answer: answer ?? currentTr?.answer ?? '',
        },
        locale,
      )
    }

    const [updatedFaq] = await db
      .select()
      .from(Faqs)
      .where(eq(Faqs.id, faqId))
      .limit(1)
    return (await getFaqByIdService(faqId, locale)) ?? updatedFaq ?? null
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
