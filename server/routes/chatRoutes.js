import express from 'express'
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getOnlineUsers,
  startVideoCall,
  startAudioCall,
  searchUsers,
} from '../controllers/chatController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Get user's conversations
router.get('/conversations', getConversations)

// Get messages between two users
router.get('/messages/:userId', getMessages)

// Send a message
router.post('/messages', sendMessage)

// Mark messages as read
router.put('/messages/:senderId/read', markAsRead)

// Delete a message
router.delete('/messages/:messageId', deleteMessage)

// Get online users
router.get('/online-users', getOnlineUsers)

// Search users
router.get('/search-users', searchUsers)

// Video/Audio calls
router.post('/video-call', startVideoCall)
router.post('/audio-call', startAudioCall)

export default router
