import express from 'express'
import {
  getAIRecommendations,
  trackRecommendationInteraction,
  getUserInsights,
} from '../controllers/aiRecommendationController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get AI recommendations
router.get('/recommendations', protect, getAIRecommendations)

// Track recommendation interaction
router.post('/recommendations/track', protect, trackRecommendationInteraction)

// Get user insights
router.get('/insights', protect, getUserInsights)

export default router
