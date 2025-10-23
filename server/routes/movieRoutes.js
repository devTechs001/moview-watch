import express from 'express'
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  likeMovie,
  rateMovie,
} from '../controllers/movieController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(getMovies).post(protect, adminOnly, createMovie)
router.route('/search').get(getMovies)
router
  .route('/:id')
  .get(getMovie)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie)
router.put('/:id/like', protect, likeMovie)
router.post('/:id/rate', protect, rateMovie)

export default router
