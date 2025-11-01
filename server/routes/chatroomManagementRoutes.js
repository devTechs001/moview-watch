import express from 'express'
import {
  deleteChatroom,
  updateChatroomSettings,
  addModerator,
  removeModerator,
  kickMember,
  banMember,
  unbanMember,
  muteMember,
  unmuteMember,
  createInviteLink,
  joinViaInvite,
  getChatroomMembers,
} from '../controllers/chatroomManagementController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Delete chatroom
router.delete('/:chatroomId', protect, deleteChatroom)

// Update chatroom settings
router.put('/:chatroomId/settings', protect, updateChatroomSettings)

// Moderator management
router.post('/:chatroomId/moderators', protect, addModerator)
router.delete('/:chatroomId/moderators/:userId', protect, removeModerator)

// Member management
router.post('/:chatroomId/kick', protect, kickMember)
router.post('/:chatroomId/ban', protect, banMember)
router.delete('/:chatroomId/ban/:userId', protect, unbanMember)
router.post('/:chatroomId/mute', protect, muteMember)
router.delete('/:chatroomId/mute/:userId', protect, unmuteMember)

// Invite links
router.post('/:chatroomId/invite', protect, createInviteLink)
router.post('/join/:code', protect, joinViaInvite)

// Get members
router.get('/:chatroomId/members', protect, getChatroomMembers)

export default router
