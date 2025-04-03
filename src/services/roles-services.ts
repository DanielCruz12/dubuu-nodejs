import { Request } from 'express'
import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { Roles } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los roles
export const getRolesService = async (_req: Request) => {
  try {
    const roles = await db.select().from(Roles)
    return roles
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los roles.')
  }
}

// 🔍 Obtener un rol por ID
export const getRoleByIdService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del rol es obligatorio.')
  }

  try {
    const [role] = await db.select().from(Roles).where(eq(Roles.id, id))
    if (!role) {
      console.error('404:', statusCodes[404])
      throw new Error('Rol no encontrado.')
    }

    return role
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al buscar el rol.')
  }
}

// ➕ Crear un nuevo rol
export const createRoleService = async (data: any) => {
  const name = data?.name?.trim()

  if (!name) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre del rol es obligatorio.')
  }

  try {
    const existing = await db
      .select()
      .from(Roles)
      .where(ilike(Roles.name, name))

    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error(`Ya existe un rol con el nombre "${name}".`)
    }

    const [newRole] = await db.insert(Roles).values(data).returning()

    return newRole
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el rol.')
  }
}

// 🔄 Actualizar un rol existente
export const updateRoleService = async (
  id: string,
  data: { name?: string },
) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del rol es obligatorio.')
  }

  if (!data?.name?.trim()) {
    console.error('400:', statusCodes[400])
    throw new Error('El nombre del rol es obligatorio para actualizar.')
  }

  try {
    const [updatedRole] = await db
      .update(Roles)
      .set({ name: data.name.trim() })
      .where(eq(Roles.id, id))
      .returning()

    if (!updatedRole) {
      console.error('404:', statusCodes[404])
      throw new Error('Rol no encontrado para actualizar.')
    }

    return updatedRole
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el rol.')
  }
}

// ❌ Eliminar un rol
export const deleteRoleService = async (id: string) => {
  if (!id) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del rol es obligatorio para eliminar.')
  }

  try {
    const [deleted] = await db.delete(Roles).where(eq(Roles.id, id)).returning()

    if (!deleted) {
      console.error('404:', statusCodes[404])
      throw new Error('Rol no encontrado para eliminar.')
    }

    return deleted
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el rol.')
  }
}
