import express from 'express'
import {
  getAlerts,
  getAlertDetails,
  resolveAlert,
  getStatistics,
  getUserActivityLogs,
  moderateContentManual,
  getSystemHealth,
} from '../controllers/aiMonitoringController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Public endpoints (for authenticated users)
router.get('/health', getSystemHealth)

// Admin only endpoints
router.use(adminOnly)

router.get('/alerts', getAlerts)
router.get('/alerts/:id', getAlertDetails)
router.put('/alerts/:id/resolve', resolveAlert)
router.get('/statistics', getStatistics)
router.get('/activity/:userId', getUserActivityLogs)
router.post('/moderate', moderateContentManual)

export default router
