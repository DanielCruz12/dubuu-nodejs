import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Roles } from '../database/schemas'

export const getRolesService = async (req: Request) => {
  return db.select().from(Roles)
}

export const getRoleByIdService = async (id: string) => {
  const [role] = await db.select().from(Roles).where(eq(Roles.id, id))
  return role
}

export const createRoleService = async (data: any) => {
  const [newRole] = await db.insert(Roles).values(data).returning()
  return newRole
}

export const updateRoleService = async (id: string, data: any) => {
  const [updatedRole] = await db
    .update(Roles)
    .set(data)
    .where(eq(Roles.id, id))
    .returning()
  return updatedRole
}

export const deleteRoleService = async (id: string) => {
  const [deleted] = await db.delete(Roles).where(eq(Roles.id, id)).returning()
  return deleted
}
