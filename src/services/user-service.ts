import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Users } from '../database/schemas'

export const getUsersService = async () => {
  return await db.select().from(Users)
}

export const createUserService = async (userData: any) => {
  try {
    const { email, id, name } = userData
    const newUser = await db.insert(Users).values({
      email,
      id,
      name,
    })
    return newUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export const getUserByIdService = async (userId: string) => {
  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1)
      .execute()

    return user[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}

export const updateUserService = async (userId: string, userData: any) => {
  try {
    const [updatedUser] = await db
      .update(Users)
      .set(userData)
      .where(eq(Users.id, userId))
      .returning()

    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

export const deleteUserService = async (userId: string) => {
  try {
    const [deletedUser] = await db
      .delete(Users)
      .where(eq(Users.id, userId))
      .returning()

    return deletedUser
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}
