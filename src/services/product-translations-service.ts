import { db } from '../database/db'
import { ProductTranslations } from '../database/schemas'
import {
  getEnabledLocales,
  detectProductLanguage,
  translateProductFields,
  type ProductTranslatableFields,
} from './translation-service'

/**
 * Guarda la traducción de un producto para un locale.
 * Si ya existe (product_id + locale), actualiza.
 */
export async function upsertProductTranslation(
  productId: string,
  locale: string,
  fields: ProductTranslatableFields,
): Promise<void> {
  await db
    .insert(ProductTranslations)
    .values({
      product_id: productId,
      locale,
      name: fields.name.slice(0, 155),
      description: fields.description,
      address: fields.address ?? '',
    })
    .onConflictDoUpdate({
      target: [ProductTranslations.product_id, ProductTranslations.locale],
      set: {
        name: fields.name.slice(0, 155),
        description: fields.description,
        address: fields.address ?? '',
        updated_at: new Date(),
      },
    })
}

/**
 * Guarda el producto con todas las traducciones habilitadas.
 * - Si no pasas sourceLocale: la API detecta el idioma del texto (name + description) con Google.
 * - Guarda en product_translations el idioma detectado (o el que enviaste) y traduce a los demás
 *   idiomas habilitados (ENABLED_LOCALES, por defecto es y en).
 *
 * @param productId - ID del producto ya creado en `products`
 * @param sourceFields - name, description, address (en español, inglés o el idioma que sea)
 * @param sourceLocale - opcional. Si no se pasa, se detecta automáticamente.
 */
export async function saveProductWithTranslations(
  productId: string,
  sourceFields: ProductTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected =
    sourceLocale ?? (await detectProductLanguage(sourceFields))
  const enabled = getEnabledLocales()

  // 1) Guardar el idioma del contenido recibido (detectado o enviado)
  await upsertProductTranslation(productId, detected, sourceFields)

  // 2) Para cada otro idioma habilitado, traducir con Google y guardar
  const toTranslate = enabled.filter(
    (locale) => locale !== detected,
  )
  for (const targetLocale of toTranslate) {
    const translated = await translateProductFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertProductTranslation(productId, targetLocale, translated)
  }
}
