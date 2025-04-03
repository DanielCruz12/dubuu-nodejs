import { Request } from 'express'
import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { TargetProductAudiences } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todas las audiencias
export const getTargetProductAudiencesService = async (_req: Request) => {
  try {
    return await db.select().from(TargetProductAudiences)
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener las audiencias objetivo.')
  }
}

// 🔍 Obtener una por ID
export const getTargetProductAudienceByIdService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID de la audiencia es obligatorio.')
  }

  try {
    const [audience] = await db
      .select()
      .from(TargetProductAudiences)
      .where(eq(TargetProductAudiences.id, id))

    if (!audience) {
      console.error('404:', statusCodes[404])
      throw new Error('Audiencia no encontrada.')
    }

    return audience
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al buscar la audiencia.')
  }
}

// ➕ Crear audiencia con validación
export const createTargetProductAudienceService = async (data: any) => {
  const name = data?.name?.trim()

  if (!name) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre de la audiencia es obligatorio.')
  }

  try {
    const existing = await db
      .select()
      .from(TargetProductAudiences)
      .where(ilike(TargetProductAudiences.name, name))

    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe una audiencia con el nombre "${name}".`)
    }

    const [newAudience] = await db
      .insert(TargetProductAudiences)
      .values(data)
      .returning()

    return newAudience
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear la audiencia.')
  }
}

// ❌ Eliminar audiencia
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
