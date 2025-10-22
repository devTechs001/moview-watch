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
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(getMovies).post(protect, admin, createMovie)
router.route('/search').get(getMovies)
router
  .route('/:id')
  .get(getMovie)
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie)
router.put('/:id/like', protect, likeMovie)
router.post('/:id/rate', protect, rateMovie)

export default router
