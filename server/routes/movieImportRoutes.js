import express from 'express'
import {
  importFromTMDB,
  importFromOMDB,
  searchTMDB,
  searchOMDB,
  bulkImportFromTMDB,
  getTMDBPopular,
  getTMDBTrending,
} from '../controllers/movieImportController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// TMDB routes
router.post('/tmdb', protect, admin, importFromTMDB)
router.get('/tmdb/search', protect, admin, searchTMDB)
router.get('/tmdb/popular', protect, admin, getTMDBPopular)
router.get('/tmdb/trending', protect, admin, getTMDBTrending)
router.post('/tmdb/bulk', protect, admin, bulkImportFromTMDB)

// OMDB routes
router.post('/omdb', protect, admin, importFromOMDB)
router.get('/omdb/search', protect, admin, searchOMDB)

export default router
