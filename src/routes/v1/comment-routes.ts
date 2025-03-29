import express from 'express'
import {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} from '../../controllers/comment-controller'

const router = express.Router()

router.get('/', getComments)            // GET /comments -> lista todos los comentarios
router.get('/:id', getCommentById)        // GET /comments/:id -> obtiene un comentario por ID
router.post('/', createComment)           // POST /comments -> crea un nuevo comentario
router.put('/:id', updateComment)         // PUT /comments/:id -> actualiza un comentario existente
router.delete('/:id', deleteComment)      // DELETE /comments/:id -> elimina un comentario por ID

export { router as commentsRoutes }
