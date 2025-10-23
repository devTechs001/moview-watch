import express from 'express'
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getComments,
  likeComment,
  deleteComment,
  sharePost,
  pinPost,
} from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Post routes
router.route('/')
  .get(getPosts)
  .post(createPost)

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost)

// Post actions
router.post('/:id/like', likePost)
router.post('/:id/share', sharePost)
router.post('/:id/pin', pinPost)

// Comment routes
router.route('/:id/comments')
  .get(getComments)
  .post(addComment)

router.post('/comments/:commentId/like', likeComment)
router.delete('/comments/:commentId', deleteComment)

export default router
