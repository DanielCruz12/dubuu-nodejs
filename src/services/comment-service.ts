import { eq } from 'drizzle-orm'
import { db } from '../database/db'
import { Comments } from '../database/schemas'
import { statusCodes } from '../utils'

// 🔍 Obtener todos los comentarios
export const getCommentsService = async () => {
  try {
    const comments = await db.select().from(Comments).execute()
    return comments
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener los comentarios.')
  }
}

// 🔍 Obtener un comentario por ID
export const getCommentByIdService = async (commentId: string) => {
  if (!commentId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del comentario es obligatorio.')
  }

  try {
    const [comment] = await db
      .select()
      .from(Comments)
      .where(eq(Comments.id, commentId))
      .limit(1)
      .execute()

    return comment || null
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al obtener el comentario.')
  }
}

// ➕ Crear un nuevo comentario
export const createCommentService = async (data: any) => {
  const { user_id, product_id, content } = data

  if (!user_id || !product_id || !content?.trim()) {
    console.error('400:', statusCodes[400])
    throw new Error('Campos obligatorios: user_id, product_id y content.')
  }

  try {
    const [newComment] = await db.insert(Comments).values(data).returning()

    return newComment
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al crear el comentario.')
  }
}

// 🔄 Actualizar un comentario
export const updateCommentService = async (commentId: string, data: any) => {
  if (!commentId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del comentario es obligatorio.')
  }

  if (!data?.content?.trim()) {
    console.error('400:', statusCodes[400])
    throw new Error('El contenido del comentario no puede estar vacío.')
  }

  try {
    const [updatedComment] = await db
      .update(Comments)
      .set(data)
      .where(eq(Comments.id, commentId))
      .returning()

    if (!updatedComment) {
      console.error('404:', statusCodes[404])
      throw new Error('Comentario no encontrado para actualizar.')
    }

    return updatedComment
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al actualizar el comentario.')
  }
}

// ❌ Eliminar un comentario por ID
export const deleteCommentService = async (commentId: string) => {
  if (!commentId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del comentario es obligatorio para eliminar.')
  }

  try {
    const [deletedComment] = await db
      .delete(Comments)
      .where(eq(Comments.id, commentId))
      .returning()

    if (!deletedComment) {
      console.error('404:', statusCodes[404])
      throw new Error('Comentario no encontrado para eliminar.')
    }

    return deletedComment
  } catch (error) {
    console.error('500:', statusCodes[500], '-', error)
    throw new Error('Error al eliminar el comentario.')
  }
}
