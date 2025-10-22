import express from 'express'
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  searchTMDB,
  importMovieFromTMDB,
  getGenres,
} from '../controllers/tmdbController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, admin)

router.post('/fetch-popular', fetchPopularMovies)
router.post('/fetch-trending', fetchTrendingMovies)
router.get('/search', searchTMDB)
router.post('/import/:tmdbId', importMovieFromTMDB)
router.get('/genres', getGenres)

export default router
