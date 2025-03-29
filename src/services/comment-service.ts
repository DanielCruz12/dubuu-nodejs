import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Comments } from '../database/schemas'

// Obtiene todos los comentarios
export const getCommentsService = async () => {
  return await db.select().from(Comments).execute()
}

// Obtiene un comentario por ID
export const getCommentByIdService = async (commentId: string) => {
  const [comment] = await db
    .select()
    .from(Comments)
    .where(eq(Comments.id, commentId))
    .limit(1)
    .execute()
  return comment || null
}

// Crea un nuevo comentario
export const createCommentService = async (data: any) => {
  try {
    const [newComment] = await db
      .insert(Comments)
      .values(data)
      .returning()
    return newComment
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }
}

// Actualiza un comentario existente
export const updateCommentService = async (commentId: string, data: any) => {
  try {
    const [updatedComment] = await db
      .update(Comments)
      .set(data)
      .where(eq(Comments.id, commentId))
      .returning()
    return updatedComment
  } catch (error) {
    console.error('Error updating comment:', error)
    throw new Error('Failed to update comment')
  }
}

// Elimina un comentario por ID
export const deleteCommentService = async (commentId: string) => {
  try {
    const [deletedComment] = await db
      .delete(Comments)
      .where(eq(Comments.id, commentId))
      .returning()
    return deletedComment
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw new Error('Failed to delete comment')
  }
}
