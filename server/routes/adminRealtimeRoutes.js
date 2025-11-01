import express from 'express'
import {
  getRealtimeComments,
  getRealtimeUsers,
  getRealtimeAnalytics,
  getRealtimeSecurity,
  getRealtimeLogs,
  getRealtimeReports,
  streamLiveActivity,
} from '../controllers/adminRealtimeController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// All routes require admin access
router.use(protect, admin)

// Real-time endpoints
router.get('/comments', getRealtimeComments)
router.get('/users', getRealtimeUsers)
router.get('/analytics', getRealtimeAnalytics)
router.get('/security', getRealtimeSecurity)
router.get('/logs', getRealtimeLogs)
router.get('/reports', getRealtimeReports)
router.get('/stream', streamLiveActivity)

export default router
