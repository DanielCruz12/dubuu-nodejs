import { db } from '../database/db'
import { TourTranslations } from '../database/schemas'
import {
  getEnabledLocales,
  detectTourLanguage,
  translateTourFields,
  type TourTranslatableFields,
} from './translation-service'

export async function upsertTourTranslation(
  productId: string,
  locale: string,
  fields: TourTranslatableFields,
): Promise<void> {
  await db
    .insert(TourTranslations)
    .values({
      product_id: productId,
      locale,
      departure_point: fields.departure_point ?? '',
      difficulty: fields.difficulty ?? '',
      highlight: fields.highlight ?? '',
      included: fields.included ?? '',
      itinerary: fields.itinerary ?? [],
      packing_list: fields.packing_list ?? [],
      expenses: fields.expenses ?? [],
    })
    .onConflictDoUpdate({
      target: [TourTranslations.product_id, TourTranslations.locale],
      set: {
        departure_point: fields.departure_point ?? '',
        difficulty: fields.difficulty ?? '',
        highlight: fields.highlight ?? '',
        included: fields.included ?? '',
        itinerary: fields.itinerary ?? [],
        packing_list: fields.packing_list ?? [],
        expenses: fields.expenses ?? [],
        updated_at: new Date(),
      },
    })
}

export async function saveTourWithTranslations(
  productId: string,
  sourceFields: TourTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? (await detectTourLanguage(sourceFields))
  const enabled = getEnabledLocales()

  await upsertTourTranslation(productId, detected, sourceFields)

  const toTranslate = enabled.filter((locale) => locale !== detected)
  for (const targetLocale of toTranslate) {
    const translated = await translateTourFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertTourTranslation(productId, targetLocale, translated)
  }
}
