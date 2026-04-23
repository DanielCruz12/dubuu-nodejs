import { db } from '../database/db'
import { HostProfileTranslations } from '../database/schemas'
import {
  getEnabledLocales,
  detectHostProfileLanguage,
  translateHostProfileFields,
  type HostProfileTranslatableFields,
} from './translation-service'

export async function upsertHostProfileTranslation(
  hostProfileId: string,
  locale: string,
  fields: HostProfileTranslatableFields,
): Promise<void> {
  await db
    .insert(HostProfileTranslations)
    .values({
      host_profile_id: hostProfileId,
      locale,
      intro: fields.intro ?? '',
      description: fields.description ?? '',
      specialty: fields.specialty ?? '',
      experience_summary: fields.experience_summary ?? '',
      hosting_style: fields.hosting_style ?? '',
      experience_tags: fields.experience_tags ?? [],
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        HostProfileTranslations.host_profile_id,
        HostProfileTranslations.locale,
      ],
      set: {
        intro: fields.intro ?? '',
        description: fields.description ?? '',
        specialty: fields.specialty ?? '',
        experience_summary: fields.experience_summary ?? '',
        hosting_style: fields.hosting_style ?? '',
        experience_tags: fields.experience_tags ?? [],
        updated_at: new Date(),
      },
    })
}

/**
 * Igual que products/tours:
 * - Si no pasas sourceLocale: detecta idioma (Google detect) desde el contenido.
 * - Guarda el idioma recibido/detectado y traduce al resto de locales habilitados.
 */
export async function saveHostProfileWithTranslations(
  hostProfileId: string,
  sourceFields: HostProfileTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected =
    sourceLocale ?? (await detectHostProfileLanguage(sourceFields))
  const enabled = getEnabledLocales()

  await upsertHostProfileTranslation(hostProfileId, detected, sourceFields)

  for (const targetLocale of enabled.filter((l) => l !== detected)) {
    const translated = await translateHostProfileFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertHostProfileTranslation(hostProfileId, targetLocale, translated)
  }
}

