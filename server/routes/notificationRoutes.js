import express from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  broadcastNotification,
} from '../controllers/notificationController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// User notification routes
router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.put('/:id/read', markAsRead)
router.put('/read-all', markAllAsRead)
router.delete('/:id', deleteNotification)
router.delete('/', deleteAllNotifications)

// Admin routes
router.post('/create', adminOnly, createNotification)
router.post('/broadcast', adminOnly, broadcastNotification)

export default router
