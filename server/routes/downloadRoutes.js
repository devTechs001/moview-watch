import express from 'express'
import {
  getDownloadLinks,
  trackDownload,
  getDownloadHistory,
} from '../controllers/downloadController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get download links for a movie
router.get('/movies/:movieId/download', protect, getDownloadLinks)

// Track download
router.post('/movies/:movieId/download/track', protect, trackDownload)

// Get download history
router.get('/downloads/history', protect, getDownloadHistory)

export default router
