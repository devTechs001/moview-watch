import express from 'express'
import {
  getSubscription,
  getPlans,
  subscribe,
  cancelSubscription,
  reactivateSubscription,
  getBillingHistory,
  getAllSubscriptions,
} from '../controllers/subscriptionController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// User routes
router.get('/my-subscription', protect, getSubscription)
router.get('/plans', getPlans)
router.post('/subscribe', protect, subscribe)
router.post('/cancel', protect, cancelSubscription)
router.post('/reactivate', protect, reactivateSubscription)
router.get('/billing-history', protect, getBillingHistory)

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllSubscriptions)

export default router
