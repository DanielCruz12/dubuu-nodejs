import { Router } from 'express'
import * as blogController from '../../controllers/blog-controller'
import { requireAuth } from '@clerk/express'

const router = Router()

// Blog Posts
router.post('/posts', requireAuth(), blogController.createPost)
router.get('/posts', blogController.getPosts)
router.get('/posts/:id', blogController.getPostById)
router.put('/posts/:id', requireAuth(), blogController.updatePost)
router.delete('/posts/:id', requireAuth(), blogController.deletePost)

// Blog Categories
router.post('/categories', requireAuth(), blogController.createCategory)
router.get('/categories', blogController.getCategories)
router.put('/categories/:id', requireAuth(), blogController.updateCategory)
router.delete('/categories/:id', requireAuth(), blogController.deleteCategory)

// Blog Likes
router.post('/likes', requireAuth(), blogController.createLike)
router.get('/posts/:postId/likes', blogController.getLikes)
router.delete('/posts/:postId/likes/:userId', requireAuth(), blogController.deleteLike)

// Blog Sections
router.post('/sections', requireAuth(), blogController.createSection)
router.get('/posts/:postId/sections', blogController.getSections)
router.put('/sections/:id', requireAuth(), blogController.updateSection)
router.delete('/sections/:id', requireAuth(), blogController.deleteSection)

export default router
