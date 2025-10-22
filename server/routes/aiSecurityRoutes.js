import express from 'express'
import {
  getSecurityDashboard,
  logSecurityEvent,
  getAIInsights,
  resolveSecurityEvent,
  getAnomalies,
} from '../controllers/aiSecurityController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, admin)

router.get('/dashboard', getSecurityDashboard)
router.route('/events').post(logSecurityEvent)
router.put('/events/:id/resolve', resolveSecurityEvent)
router.get('/insights', getAIInsights)
router.get('/anomalies', getAnomalies)

export default router
