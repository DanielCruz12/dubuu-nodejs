import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { TargetProductAudiences } from '../database/schemas'

export const getTargetProductAudiencesService = async (req: Request) => {
  return db.select().from(TargetProductAudiences)
}

export const getTargetProductAudienceByIdService = async (id: string) => {
  const [audience] = await db
    .select()
    .from(TargetProductAudiences)
    .where(eq(TargetProductAudiences.id, id))
  return audience
}

export const createTargetProductAudienceService = async (data: any) => {
  const [newAudience] = await db
    .insert(TargetProductAudiences)
    .values(data)
    .returning()
  return newAudience
}

export const deleteTargetProductAudienceService = async (id: string) => {
  const [deleted] = await db
    .delete(TargetProductAudiences)
    .where(eq(TargetProductAudiences.id, id))
    .returning()
  return deleted
}
