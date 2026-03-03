import { db } from '../database/db'
import { FaqTranslations } from '../database/schemas'
import {
  getEnabledLocales,
  detectFaqLanguage,
  translateFaqFields,
  type FaqTranslatableFields,
} from './translation-service'

export async function upsertFaqTranslation(
  faqId: string,
  locale: string,
  fields: FaqTranslatableFields,
): Promise<void> {
  await db
    .insert(FaqTranslations)
    .values({
      faq_id: faqId,
      locale,
      question: fields.question,
      answer: fields.answer,
    })
    .onConflictDoUpdate({
      target: [FaqTranslations.faq_id, FaqTranslations.locale],
      set: {
        question: fields.question,
        answer: fields.answer,
        updated_at: new Date(),
      },
    })
}

export async function saveFaqWithTranslations(
  faqId: string,
  sourceFields: FaqTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? (await detectFaqLanguage(sourceFields))
  const enabled = getEnabledLocales()

  await upsertFaqTranslation(faqId, detected, sourceFields)

  const toTranslate = enabled.filter((locale) => locale !== detected)
  for (const targetLocale of toTranslate) {
    const translated = await translateFaqFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertFaqTranslation(faqId, targetLocale, translated)
  }
}
