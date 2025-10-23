import express from 'express'
import {
  getPublicChatrooms,
  getUserChatrooms,
  getChatroom,
  createChatroom,
  joinChatroom,
  leaveChatroom,
  getChatroomMessages,
  sendMessage,
  reactToMessage,
  deleteChatroom,
} from '../controllers/chatroomController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public chatrooms
router.get('/public', getPublicChatrooms)

// User chatrooms
router.get('/my-chatrooms', protect, getUserChatrooms)

// Get single chatroom
router.get('/:chatroomId', protect, getChatroom)

// Create chatroom
router.post('/', protect, createChatroom)

// Join/Leave chatroom
router.post('/:chatroomId/join', protect, joinChatroom)
router.post('/:chatroomId/leave', protect, leaveChatroom)

// Messages
router.get('/:chatroomId/messages', protect, getChatroomMessages)
router.post('/:chatroomId/messages', protect, sendMessage)

// React to message
router.post('/messages/:messageId/react', protect, reactToMessage)

// Delete chatroom
router.delete('/:chatroomId', protect, deleteChatroom)

export default router
