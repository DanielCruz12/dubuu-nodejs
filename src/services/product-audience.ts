import { Request } from 'express'
import { and, eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import {
  TargetProductAudiences,
  TargetProductAudienceTranslations,
} from '../database/schemas'
import { statusCodes } from '../utils'
import {
  getDefaultLocale,
  getEnabledLocales,
} from './translation-service'
import { saveTargetProductAudienceWithTranslations } from './product-catalog-translations-service'

export const getTargetProductAudiencesService = async (
  _req: Request,
  locale?: string,
) => {
  const lang = locale ?? getDefaultLocale()
  try {
    return await db
      .select({
        id: TargetProductAudiences.id,
        name: TargetProductAudienceTranslations.name,
        description: TargetProductAudienceTranslations.description,
        created_at: TargetProductAudiences.created_at,
        updated_at: TargetProductAudiences.updated_at,
      })
      .from(TargetProductAudiences)
      .innerJoin(
        TargetProductAudienceTranslations,
        and(
          eq(TargetProductAudiences.id, TargetProductAudienceTranslations.audience_id),
          eq(TargetProductAudienceTranslations.locale, lang),
        ),
      )
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las audiencias objetivo.')
  }
}

export const getTargetProductAudienceByIdService = async (
  id: string,
  locale?: string,
) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la audiencia es obligatorio.')
  }
  const lang = locale ?? getDefaultLocale()
  try {
    const [row] = await db
      .select({
        id: TargetProductAudiences.id,
        name: TargetProductAudienceTranslations.name,
        description: TargetProductAudienceTranslations.description,
        created_at: TargetProductAudiences.created_at,
        updated_at: TargetProductAudiences.updated_at,
      })
      .from(TargetProductAudiences)
      .innerJoin(
        TargetProductAudienceTranslations,
        and(
          eq(TargetProductAudiences.id, TargetProductAudienceTranslations.audience_id),
          eq(TargetProductAudienceTranslations.locale, lang),
        ),
      )
      .where(eq(TargetProductAudiences.id, id))
    if (!row) {
      console.error('404:', statusCodes[404])
      throw new Error('Audiencia no encontrada.')
    }
    return row
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al buscar la audiencia.')
  }
}

export const createTargetProductAudienceService = async (data: any) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim() ?? ''
  const requestedLocale = data?.locale?.trim()?.toLowerCase()
  const enabled = getEnabledLocales()
  const locale = requestedLocale && enabled.includes(requestedLocale)
    ? requestedLocale
    : undefined

  if (!name) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre de la audiencia es obligatorio.')
  }

  const lang = locale ?? getDefaultLocale()
  try {
    const existing = await db
      .select()
      .from(TargetProductAudienceTranslations)
      .where(
        and(
          eq(TargetProductAudienceTranslations.locale, lang),
          ilike(TargetProductAudienceTranslations.name, name),
        ),
      )
    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe una audiencia con el nombre "${name}".`)
    }

    const [newAudience] = await db
      .insert(TargetProductAudiences)
      .values({})
      .returning()
    if (!newAudience) throw new Error('Error al crear la audiencia.')
    await saveTargetProductAudienceWithTranslations(
      newAudience.id,
      { name, description },
      locale,
    )
    return await getTargetProductAudienceByIdService(newAudience.id, locale)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear la audiencia.')
  }
}

export const updateTargetProductAudienceService = async (
  id: string,
  data: any,
) => {
  const name = data?.name?.trim()
  const description = data?.description?.trim()
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID es obligatorio para actualizar.')
  }
  if (name !== undefined || description !== undefined) {
    const [cur] = await db
      .select()
      .from(TargetProductAudienceTranslations)
      .where(
        and(
          eq(TargetProductAudienceTranslations.audience_id, id),
          eq(TargetProductAudienceTranslations.locale, getDefaultLocale()),
        ),
      )
      .limit(1)
    await saveTargetProductAudienceWithTranslations(id, {
      name: name ?? cur?.name ?? '',
      description: description ?? cur?.description ?? '',
    })
  }
  return await getTargetProductAudienceByIdService(id)
}

export const deleteTargetProductAudienceService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID es obligatorio para eliminar la audiencia.')
  }
  try {
    const [deleted] = await db
      .delete(TargetProductAudiences)
      .where(eq(TargetProductAudiences.id, id))
      .returning()
    if (!deleted) {
      console.error('404:', statusCodes[404])
      throw new Error('No se encontró la audiencia para eliminar.')
    }
    return deleted
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar la audiencia.')
  }
}
