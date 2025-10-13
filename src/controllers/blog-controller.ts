import { Request, Response } from 'express'
import * as blogService from '../services/blog-service'

// Blog Posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const post = await blogService.createPost(req.body)
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error })
  }
}

export const getPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await blogService.getPosts()
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error getting posts', error })
  }
}

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await blogService.getPostById(req.params.id)
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error getting post', error })
  }
}

export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await blogService.updatePost(req.params.id, req.body)
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error })
  }
}

export const deletePost = async (req: Request, res: Response) => {
  try {
    await blogService.deletePost(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error })
  }
}

// Blog Categories
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await blogService.createCategory(req.body)
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error })
  }
}

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await blogService.getCategories()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ message: 'Error getting categories', error })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await blogService.updateCategory(req.params.id, req.body)
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await blogService.deleteCategory(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error })
  }
}

// Blog Likes
export const createLike = async (req: Request, res: Response) => {
  try {
    const like = await blogService.createLike(req.body)
    res.status(201).json(like)
  } catch (error) {
    res.status(500).json({ message: 'Error creating like', error })
  }
}

export const getLikes = async (req: Request, res: Response) => {
  try {
    const likes = await blogService.getLikes(req.params.postId)
    res.status(200).json(likes)
  } catch (error) {
    res.status(500).json({ message: 'Error getting likes', error })
  }
}

export const deleteLike = async (req: Request, res: Response) => {
  try {
    await blogService.deleteLike(req.params.postId, req.params.userId)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error deleting like', error })
  }
}

// Blog Sections
export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await blogService.createSection(req.body)
    res.status(201).json(section)
  } catch (error) {
    res.status(500).json({ message: 'Error creating section', error })
  }
}

export const getSections = async (req: Request, res: Response) => {
  try {
    const sections = await blogService.getSections(req.params.postId)
    res.status(200).json(sections)
  } catch (error) {
    res.status(500).json({ message: 'Error getting sections', error })
  }
}

export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await blogService.updateSection(req.params.id, req.body)
    res.status(200).json(section)
  } catch (error) {
    res.status(500).json({ message: 'Error updating section', error })
  }
}

export const deleteSection = async (req: Request, res: Response) => {
  try {
    await blogService.deleteSection(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error })
  }
}
