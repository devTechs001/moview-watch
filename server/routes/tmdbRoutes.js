import express from 'express'
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  searchTMDB,
  importMovieFromTMDB,
  getGenres,
} from '../controllers/tmdbController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, adminOnly)

router.post('/fetch-popular', fetchPopularMovies)
router.post('/fetch-trending', fetchTrendingMovies)
router.get('/search', searchTMDB)
router.post('/import/:tmdbId', importMovieFromTMDB)
router.get('/genres', getGenres)

export default router
