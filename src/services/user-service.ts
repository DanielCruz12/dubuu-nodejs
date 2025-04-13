import { eq, ilike } from 'drizzle-orm'
import { db } from '../database/db'
import { Users } from '../database/schemas'
import { statusCodes } from '../utils'
import { decrypt, encrypt } from '../utils/crypto'

interface CreateUserInput {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
}

interface UpdateUserInput {
  email?: string
  username?: string
  first_name?: string
  last_name?: string
  address?: string
  city?: string
  country?: string
  id_region?: string
  phone_number?: string
  zip_code?: string
}

// 🔍 Obtener todos los usuarios
export const getUsersService = async () => {
  try {
    const users = await db.select().from(Users)

    return users.map((user) => ({
      ...user,
      email: decrypt(user.email),
      phone_number: user.phone_number ? decrypt(user.phone_number) : '',
    }))
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener usuarios.')
  }
}

// 🔍 Obtener usuario por ID
export const getUserByIdService = async (userId: string) => {
  if (!userId) {
    throw new Error('El ID del usuario es obligatorio.')
  }

  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1)
      .execute()

    if (user.length === 0) return null

    return {
      ...user[0],
      email: decrypt(user[0].email),
      phone_number: user[0].phone_number ? decrypt(user[0].phone_number) : null,
    }
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el usuario.')
  }
}

// ➕ Crear usuario
export const createUserService = async (userData: CreateUserInput) => {
  const { id, email, username, first_name = '', last_name = '' } = userData

  try {
    const existing = await db
      .select()
      .from(Users)
      .where(ilike(Users.email, email))

    if (existing.length > 0) {
      throw new Error('Ya existe un usuario con este correo electrónico.')
    }

    const encryptedEmail = encrypt(email)

    const [newUser] = await db
      .insert(Users)
      .values({
        id,
        email: encryptedEmail,
        username,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      })
      .returning()

    return {
      ...newUser,
      email,
    }
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('No se pudo crear el usuario.')
  }
}

// 🔄 Actualizar usuario
export const updateUserService = async (
  userId: string,
  userData: UpdateUserInput,
) => {
  if (!userId) {
    throw new Error('El ID del usuario es obligatorio para actualizar.')
  }

  try {
    const dataToUpdate: any = { ...userData }

    if (userData.email) {
      dataToUpdate.email = encrypt(userData.email)
    }

    if (userData.phone_number) {
      dataToUpdate.phone_number = encrypt(userData.phone_number)
    }

    const [updatedUser] = await db
      .update(Users)
      .set(dataToUpdate)
      .where(eq(Users.id, userId))
      .returning()

    if (!updatedUser) {
      throw new Error('Usuario no encontrado para actualizar.')
    }

    return updatedUser
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el usuario.')
  }
}

// ❌ Eliminar usuario
export const deleteUserService = async (userId: string) => {
  if (!userId) {
    throw new Error('El ID del usuario es obligatorio para eliminar.')
  }

  try {
    const [deletedUser] = await db
      .delete(Users)
      .where(eq(Users.id, userId))
      .returning()

    if (!deletedUser) {
      throw new Error('Usuario no encontrado para eliminar.')
    }

    return deletedUser
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el usuario.')
  }
}
