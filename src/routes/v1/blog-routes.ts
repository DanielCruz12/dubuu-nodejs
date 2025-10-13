import { Router } from 'express'
import * as blogController from '../../controllers/blog-controller'

const router = Router()

// Blog Posts
router.post('/posts', blogController.createPost)
router.get('/posts', blogController.getPosts)
router.get('/posts/:id', blogController.getPostById)
router.put('/posts/:id', blogController.updatePost)
router.delete('/posts/:id', blogController.deletePost)

// Blog Categories
router.post('/categories', blogController.createCategory)
router.get('/categories', blogController.getCategories)
router.put('/categories/:id', blogController.updateCategory)
router.delete('/categories/:id', blogController.deleteCategory)

// Blog Likes
router.post('/likes', blogController.createLike)
router.get('/posts/:postId/likes', blogController.getLikes)
router.delete('/posts/:postId/likes/:userId', blogController.deleteLike)

// Blog Sections
router.post('/sections', blogController.createSection)
router.get('/posts/:postId/sections', blogController.getSections)
router.put('/sections/:id', blogController.updateSection)
router.delete('/sections/:id', blogController.deleteSection)

export default router
