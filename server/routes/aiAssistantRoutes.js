import express from 'express'
import {
  chatWithAI,
  getChatHistory,
  rateAIResponse,
  toggleAIFeature,
  getAISettings,
} from '../controllers/aiAssistantController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// User routes
router.post('/chat', protect, chatWithAI)
router.get('/history', protect, getChatHistory)
router.post('/rate', protect, rateAIResponse)

// Admin routes
router.put('/toggle/:feature', protect, admin, toggleAIFeature)
router.get('/settings', protect, admin, getAISettings)

export default router
