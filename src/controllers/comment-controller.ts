import { Request, Response } from 'express'
import {
  getCommentsService,
  getCommentByIdService,
  createCommentService,
  updateCommentService,
  deleteCommentService,
} from '../services/comment-service'
import { statusCodes } from '../utils'

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await getCommentsService()
    res.status(200).json(comments)
  } catch (error: any) {
    const message = statusCodes[error.status] || 'Internal Server Error'
    res.status(error.status || 500).json({ message })
  }
}

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const comment = await getCommentByIdService(id)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createComment = async (req: Request, res: Response) => {
  try {
    const newComment = await createCommentService(req.body)
    res.status(201).json(newComment)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedComment = await updateCommentService(id, req.body)
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    res.status(200).json(updatedComment)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deletedComment = await deleteCommentService(id)
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
