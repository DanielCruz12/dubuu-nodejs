import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { Users } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los usuarios
export const getUsersService = async () => {
  try {
    const users = await db.select().from(Users)
    return users
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener usuarios.')
  }
}

// ➕ Crear un nuevo usuario con validación básica
export const createUserService = async (userData: any) => {
  const { id, email, username, first_name, last_name } = userData

  if (!id || !email || !username) {
    console.error('400:', statusCodes[400])
    throw new Error('Faltan campos obligatorios: id, email o username.')
  }

  try {
    // Validar duplicados por email
    const existing = await db
      .select()
      .from(Users)
      .where(ilike(Users.email, email))

    if (existing.length > 0) {
      console.error('409:', statusCodes[409])
      throw new Error('Ya existe un usuario con este correo electrónico.')
    }

    const [newUser] = await db
      .insert(Users)
      .values({
        id,
        email,
        username,
        first_name: first_name?.trim() || '',
        last_name: last_name?.trim() || '',
      })
      .returning()

    return newUser
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('No se pudo crear el usuario.')
  }
}

// 🔍 Obtener usuario por ID
export const getUserByIdService = async (userId: string) => {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio.')
  }

  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1)
      .execute()

    return user[0] || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el usuario.')
  }
}

// 🔄 Actualizar usuario por ID
export const updateUserService = async (userId: string, userData: any) => {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio para actualizar.')
  }

  try {
    const [updatedUser] = await db
      .update(Users)
      .set(userData)
      .where(eq(Users.id, userId))
      .returning()

    if (!updatedUser) {
      console.error('404:', statusCodes[404])
      throw new Error('Usuario no encontrado para actualizar.')
    }

    return updatedUser
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el usuario.')
  }
}

// ❌ Eliminar usuario por ID
export const deleteUserService = async (userId: string) => {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio para eliminar.')
  }

  try {
    const [deletedUser] = await db
      .delete(Users)
      .where(eq(Users.id, userId))
      .returning()

    if (!deletedUser) {
      console.error('404:', statusCodes[404])
      throw new Error('Usuario no encontrado para eliminar.')
    }

    return deletedUser
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el usuario.')
  }
}
