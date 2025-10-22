import express from 'express'
import {
  getComments,
  createComment,
  deleteComment,
  likeComment,
} from '../controllers/commentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/:movieId').get(getComments).post(protect, createComment)
router
  .route('/:id')
  .delete(protect, deleteComment)
router.put('/:id/like', protect, likeComment)

export default router
