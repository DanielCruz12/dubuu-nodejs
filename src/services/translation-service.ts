import axios from 'axios'

/** Lee la key en tiempo de ejecución para que dotenv ya haya cargado .env (import 'dotenv/config' en index). */
function getGoogleTranslateApiKey(): string | undefined {
  return process.env.GOOGLE_TRANSLATE_API_KEY?.trim() || undefined
}

/**
 * Referer para peticiones a Google Translation API.
 * Si la clave está restringida a "Sitios web" (dubuu.com), las peticiones desde el backend
 * deben enviar este header para que Google no bloquee con 403 "Requests from referer <empty> are blocked".
 * Usa GOOGLE_TRANSLATE_REFERER o FRONTEND_URL; si no, por defecto https://www.dubuu.com/
 */
function getGoogleTranslateReferer(): string {
  const ref =
    process.env.GOOGLE_TRANSLATE_REFERER?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    'https://www.dubuu.com/'
  return ref.endsWith('/') ? ref : `${ref}/`
}

const BASE_URL = 'https://translation.googleapis.com/language/translate/v2'

/** Idiomas habilitados en la app. Añadir más en el futuro (ej. 'pt') aquí o por env ENABLED_LOCALES=es,en,pt */
const ENABLED_LOCALES = (process.env.ENABLED_LOCALES ?? 'es,en')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function getEnabledLocales(): string[] {
  return [...ENABLED_LOCALES]
}

/** Locale por defecto para lecturas cuando el cliente no envía ?locale= */
export function getDefaultLocale(): string {
  return ENABLED_LOCALES[0] ?? 'es'
}

/**
 * Detecta el idioma de un texto con Google Cloud Translation API (v2 detect).
 * Devuelve código ISO 639-1 (ej. 'es', 'en'). Si falla, devuelve 'en'.
 */
export async function detectLanguage(text: string): Promise<string> {
  if (!text?.trim()) return 'en'
  const key = getGoogleTranslateApiKey()
  if (!key) {
    console.warn('GOOGLE_TRANSLATE_API_KEY no definida; asumiendo "en".')
    return 'en'
  }
  try {
    const body = new URLSearchParams({
      q: text.slice(0, 5000),
      key,
    }).toString()
    const { data } = await axios.post(
      'https://translation.googleapis.com/language/translate/v2/detect',
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: getGoogleTranslateReferer(),
        },
        maxBodyLength: Infinity,
      },
    )
    const lang = data?.data?.detections?.[0]?.[0]?.language
    return (lang && String(lang).slice(0, 2)) || 'en'
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message ?? err?.message
    console.error('Error en detectLanguage:', msg)
    return 'en'
  }
}

/**
 * Detecta el idioma a partir de name + description (lo más representativo del contenido).
 */
export async function detectProductLanguage(fields: {
  name: string
  description: string
}): Promise<string> {
  const combined = [fields.name, fields.description].filter(Boolean).join(' ')
  return detectLanguage(combined)
}


/**
 * Traduce un texto con Google Cloud Translation API (v2).
 * Requiere GOOGLE_TRANSLATE_API_KEY en .env.
 * Códigos de idioma ISO 639-1: 'es', 'en', 'pt', etc.
 */
export async function translateText(
  text: string,
  targetLocale: string,
  sourceLocale?: string,
): Promise<string> {
  if (!text?.trim()) return text
  const key = getGoogleTranslateApiKey()
  if (!key) {
    console.warn(
      'GOOGLE_TRANSLATE_API_KEY no definida; devolviendo texto original.',
    )
    return text
  }

  try {
    const params = new URLSearchParams({
      q: text,
      target: targetLocale.slice(0, 2),
      key,
      format: 'text',
    })
    if (sourceLocale) params.set('source', sourceLocale.slice(0, 2))
    const { data } = await axios.post(BASE_URL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: getGoogleTranslateReferer(),
      },
      maxBodyLength: Infinity,
    })
    return data?.data?.translations?.[0]?.translatedText ?? text
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message ?? err?.message
    const status = err?.response?.status
    console.error(
      `[Traducción] Error al traducir (${sourceLocale ?? 'auto'} → ${targetLocale}):`,
      status ? `HTTP ${status}` : '',
      msg,
    )
    return text
  }
}

/**
 * Traduce varios textos en una sola llamada (menos requests = menos ancho de banda).
 */
export async function translateTexts(
  texts: string[],
  targetLocale: string,
  sourceLocale?: string,
): Promise<string[]> {
  const filtered = texts.filter((t) => t != null && String(t).trim() !== '')
  if (filtered.length === 0) return texts

  const key = getGoogleTranslateApiKey()
  if (!key) {
    console.warn(
      'GOOGLE_TRANSLATE_API_KEY no definida; devolviendo textos originales.',
    )
    return texts
  }

  try {
    const search = new URLSearchParams({
      target: targetLocale.slice(0, 2),
      key,
      format: 'text',
    })
    if (sourceLocale) search.set('source', sourceLocale.slice(0, 2))
    filtered.forEach((t) => search.append('q', t))

    const { data } = await axios.post(BASE_URL, search.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: getGoogleTranslateReferer(),
      },
      maxBodyLength: Infinity,
    })

    const translated = (data?.data?.translations ?? []).map(
      (t: { translatedText?: string }) => t?.translatedText ?? '',
    )
    let i = 0
    return texts.map((t) =>
      t != null && String(t).trim() !== '' ? translated[i++] ?? t : t,
    )
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message ?? err?.message
    const status = err?.response?.status
    console.error(
      `[Traducción] Error en translateTexts (${sourceLocale ?? 'auto'} → ${targetLocale}):`,
      status ? `HTTP ${status}` : '',
      msg,
    )
    return texts
  }
}

export type ProductTranslatableFields = {
  name: string
  description: string
  address?: string
}

/**
 * Traduce los campos de producto a un idioma objetivo (una llamada por idioma).
 */
export async function translateProductFields(
  fields: ProductTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<ProductTranslatableFields> {
  const [name, description, address] = await translateTexts(
    [
      fields.name,
      fields.description,
      (fields.address ?? '').trim() || fields.name,
    ],
    targetLocale,
    sourceLocale,
  )
  return {
    name,
    description,
    address: (fields.address ?? '').trim() ? address : '',
  }
}

export type TourTranslatableFields = {
  departure_point: string
  difficulty: string
  highlight: string
  included: string
  itinerary: string[]
  packing_list: string[]
  expenses: string[]
}

/**
 * Traduce campos del tour. Arrays se traducen elemento a elemento.
 */
export async function translateTourFields(
  fields: TourTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<TourTranslatableFields> {
  const flat = [
    fields.departure_point,
    fields.difficulty,
    fields.highlight,
    fields.included,
    ...(fields.itinerary ?? []),
    ...(fields.packing_list ?? []),
    ...(fields.expenses ?? []),
  ]
  const translated = await translateTexts(flat, targetLocale, sourceLocale)
  const n = 4
  const itineraryLen = (fields.itinerary ?? []).length
  const packingLen = (fields.packing_list ?? []).length
  return {
    departure_point: translated[0] ?? '',
    difficulty: translated[1] ?? '',
    highlight: translated[2] ?? '',
    included: translated[3] ?? '',
    itinerary: translated.slice(n, n + itineraryLen),
    packing_list: translated.slice(n + itineraryLen, n + itineraryLen + packingLen),
    expenses: translated.slice(n + itineraryLen + packingLen),
  }
}

export type FaqTranslatableFields = { question: string; answer: string }

export async function translateFaqFields(
  fields: FaqTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<FaqTranslatableFields> {
  const [question, answer] = await translateTexts(
    [fields.question, fields.answer],
    targetLocale,
    sourceLocale,
  )
  return { question, answer }
}

/** Detecta idioma para tour (departure_point + highlight + included). */
export async function detectTourLanguage(
  fields: TourTranslatableFields,
): Promise<string> {
  const combined = [
    fields.departure_point,
    fields.highlight,
    fields.included,
    (fields.itinerary ?? []).slice(0, 2).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
  return detectLanguage(combined)
}

/** Detecta idioma a partir de question + answer */
export async function detectFaqLanguage(
  fields: FaqTranslatableFields,
): Promise<string> {
  return detectLanguage(
    [fields.question, fields.answer].filter(Boolean).join(' '),
  )
}

export type BlogPostTranslatableFields = {
  title: string
  slug: string
  author_bio?: string | null
}
export type BlogSectionTranslatableFields = { title: string; content: string }
export type BlogCategoryTranslatableFields = {
  name: string
  description?: string | null
}

export async function translateBlogPostFields(
  fields: BlogPostTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<BlogPostTranslatableFields> {
  const [title, slug, author_bio] = await translateTexts(
    [
      fields.title,
      fields.slug,
      fields.author_bio ?? fields.title,
    ],
    targetLocale,
    sourceLocale,
  )
  return { title, slug, author_bio: fields.author_bio ? author_bio : null }
}

export async function translateBlogSectionFields(
  fields: BlogSectionTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<BlogSectionTranslatableFields> {
  const [title, content] = await translateTexts(
    [fields.title, fields.content],
    targetLocale,
    sourceLocale,
  )
  return { title, content }
}

export async function translateBlogCategoryFields(
  fields: BlogCategoryTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<BlogCategoryTranslatableFields> {
  const [name, description] = await translateTexts(
    [fields.name, fields.description ?? fields.name],
    targetLocale,
    sourceLocale,
  )
  return { name, description: fields.description ? description : null }
}

export async function detectBlogPostLanguage(
  fields: BlogPostTranslatableFields,
): Promise<string> {
  return detectLanguage([fields.title, fields.author_bio ?? ''].join(' '))
}
export async function detectBlogCategoryLanguage(
  fields: BlogCategoryTranslatableFields,
): Promise<string> {
  return detectLanguage([fields.name, fields.description ?? ''].join(' '))
}

export type CatalogTranslatableFields = { name: string; description: string }

export async function translateCatalogFields(
  fields: CatalogTranslatableFields,
  targetLocale: string,
  sourceLocale: string,
): Promise<CatalogTranslatableFields> {
  const [name, description] = await translateTexts(
    [fields.name, fields.description],
    targetLocale,
    sourceLocale,
  )
  return { name, description }
}

export async function detectCatalogLanguage(
  fields: CatalogTranslatableFields,
): Promise<string> {
  return detectLanguage([fields.name, fields.description].join(' '))
}
