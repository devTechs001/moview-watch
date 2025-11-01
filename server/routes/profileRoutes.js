import express from 'express'
import {
  trackProfileView,
  getProfileViews,
  getUserProfile,
  updateProfile,
  updateSettings,
} from '../controllers/profileController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/:userId/view', trackProfileView)
router.get('/views', protect, getProfileViews)
router.get('/:userId', getUserProfile)
router.put('/', protect, updateProfile)
router.put('/settings', protect, updateSettings)

export default router
