import express from 'express'
import {
  getShorts,
  uploadShort,
  likeShort,
  getMusic,
  uploadMusic,
  playMusic,
  getAnimations,
  getAnimation,
  addAnimation,
  likeAnimation,
} from '../controllers/contentLibraryController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// Shorts routes
router.get('/shorts', getShorts)
router.post('/shorts', protect, uploadShort)
router.post('/shorts/:id/like', protect, likeShort)

// Music routes
router.get('/music', getMusic)
router.post('/music', protect, uploadMusic)
router.post('/music/:id/play', playMusic)

// Animation routes
router.get('/animations', getAnimations)
router.get('/animations/:id', getAnimation)
router.post('/animations', protect, admin, addAnimation)
router.post('/animations/:id/like', protect, likeAnimation)

export default router
