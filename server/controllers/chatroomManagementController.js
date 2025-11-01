import Chatroom from '../models/Chatroom.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { emitToRoom, emitSocketEvent } from '../utils/socket.js'
import crypto from 'crypto'

// @desc    Delete/Remove chatroom
// @route   DELETE /api/chatrooms/:chatroomId
// @access  Private (Admin/Creator only)
export const deleteChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const chatroom = await Chatroom.findById(chatroomId)

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check if user is creator or admin
    const member = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (chatroom.creator.toString() !== req.user._id.toString() && member?.role !== 'admin') {
      return res.status(403).json({ message: 'Only chatroom creator or admin can delete' })
    }

    // Delete all messages
    await Message.deleteMany({ chatroom: chatroomId })

    // Delete chatroom
    await Chatroom.findByIdAndDelete(chatroomId)

    // Notify all members
    emitToRoom(req, `chatroom-${chatroomId}`, 'chatroom_deleted', {
      chatroomId,
      message: 'This chatroom has been deleted',
    })

    res.json({ message: 'Chatroom deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update chatroom settings
// @route   PUT /api/chatrooms/:chatroomId/settings
// @access  Private (Admin only)
export const updateChatroomSettings = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { name, description, avatar, settings } = req.body

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const member = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!member || (member.role !== 'admin' && !member.permissions.canEditRoom)) {
      return res.status(403).json({ message: 'No permission to edit chatroom' })
    }

    // Update fields
    if (name) chatroom.name = name
    if (description) chatroom.description = description
    if (avatar) chatroom.avatar = avatar
    if (settings) chatroom.settings = { ...chatroom.settings, ...settings }

    await chatroom.save()

    // Notify members
    emitToRoom(req, `chatroom-${chatroomId}`, 'chatroom_updated', {
      chatroom,
      updatedBy: req.user._id,
    })

    res.json({ chatroom, message: 'Chatroom updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add moderator
// @route   POST /api/chatrooms/:chatroomId/moderators
// @access  Private (Admin only)
export const addModerator = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { userId } = req.body

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check if requester is admin
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add moderators' })
    }

    // Check if user is member
    const member = chatroom.members.find(m => m.user.toString() === userId)
    if (!member) {
      return res.status(404).json({ message: 'User is not a member' })
    }

    // Update role to moderator
    member.role = 'moderator'
    member.permissions = {
      canSendMessages: true,
      canDeleteMessages: true,
      canKickMembers: true,
      canBanMembers: false,
      canEditRoom: false,
      canManageRoles: false,
    }

    if (!chatroom.moderators.includes(userId)) {
      chatroom.moderators.push(userId)
    }

    await chatroom.save()

    // Notify
    emitToRoom(req, `chatroom-${chatroomId}`, 'moderator_added', {
      userId,
      chatroomId,
    })

    res.json({ chatroom, message: 'Moderator added successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove moderator
// @route   DELETE /api/chatrooms/:chatroomId/moderators/:userId
// @access  Private (Admin only)
export const removeModerator = async (req, res) => {
  try {
    const { chatroomId, userId } = req.params

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove moderators' })
    }

    // Update member role
    const member = chatroom.members.find(m => m.user.toString() === userId)
    if (member) {
      member.role = 'member'
      member.permissions = {
        canSendMessages: true,
        canDeleteMessages: false,
        canKickMembers: false,
        canBanMembers: false,
        canEditRoom: false,
        canManageRoles: false,
      }
    }

    chatroom.moderators = chatroom.moderators.filter(id => id.toString() !== userId)
    await chatroom.save()

    emitToRoom(req, `chatroom-${chatroomId}`, 'moderator_removed', { userId })

    res.json({ message: 'Moderator removed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Kick member
// @route   POST /api/chatrooms/:chatroomId/kick
// @access  Private (Admin/Moderator)
export const kickMember = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { userId, reason } = req.body

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || (!['admin', 'moderator'].includes(requester.role) && !requester.permissions.canKickMembers)) {
      return res.status(403).json({ message: 'No permission to kick members' })
    }

    // Remove member
    chatroom.members = chatroom.members.filter(m => m.user.toString() !== userId)
    await chatroom.save()

    // Notify
    emitToRoom(req, `chatroom-${chatroomId}`, 'member_kicked', {
      userId,
      reason,
      kickedBy: req.user._id,
    })

    emitToRoom(req, userId, 'kicked_from_chatroom', {
      chatroomId,
      reason,
    })

    res.json({ message: 'Member kicked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Ban member
// @route   POST /api/chatrooms/:chatroomId/ban
// @access  Private (Admin/Moderator)
export const banMember = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { userId, reason } = req.body

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || (requester.role !== 'admin' && !requester.permissions.canBanMembers)) {
      return res.status(403).json({ message: 'No permission to ban members' })
    }

    // Add to banned list
    chatroom.bannedUsers.push({
      user: userId,
      bannedBy: req.user._id,
      reason,
    })

    // Remove from members
    chatroom.members = chatroom.members.filter(m => m.user.toString() !== userId)
    await chatroom.save()

    // Notify
    emitToRoom(req, `chatroom-${chatroomId}`, 'member_banned', {
      userId,
      reason,
    })

    emitToRoom(req, userId, 'banned_from_chatroom', {
      chatroomId,
      reason,
    })

    res.json({ message: 'Member banned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unban member
// @route   DELETE /api/chatrooms/:chatroomId/ban/:userId
// @access  Private (Admin only)
export const unbanMember = async (req, res) => {
  try {
    const { chatroomId, userId } = req.params

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can unban members' })
    }

    chatroom.bannedUsers = chatroom.bannedUsers.filter(b => b.user.toString() !== userId)
    await chatroom.save()

    emitToRoom(req, userId, 'unbanned_from_chatroom', { chatroomId })

    res.json({ message: 'Member unbanned successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Mute member
// @route   POST /api/chatrooms/:chatroomId/mute
// @access  Private (Admin/Moderator)
export const muteMember = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { userId, duration } = req.body // duration in minutes

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check permissions
    const requester = chatroom.members.find(m => m.user.toString() === req.user._id.toString())
    if (!requester || !['admin', 'moderator'].includes(requester.role)) {
      return res.status(403).json({ message: 'No permission to mute members' })
    }

    const member = chatroom.members.find(m => m.user.toString() === userId)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }

    member.isMuted = true
    member.mutedUntil = duration ? new Date(Date.now() + duration * 60 * 1000) : null
    member.permissions.canSendMessages = false

    await chatroom.save()

    emitToRoom(req, `chatroom-${chatroomId}`, 'member_muted', {
      userId,
      duration,
    })

    res.json({ message: 'Member muted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Unmute member
// @route   DELETE /api/chatrooms/:chatroomId/mute/:userId
// @access  Private (Admin/Moderator)
export const unmuteMember = async (req, res) => {
  try {
    const { chatroomId, userId } = req.params

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    const member = chatroom.members.find(m => m.user.toString() === userId)
    if (member) {
      member.isMuted = false
      member.mutedUntil = null
      member.permissions.canSendMessages = true
    }

    await chatroom.save()

    emitToRoom(req, `chatroom-${chatroomId}`, 'member_unmuted', { userId })

    res.json({ message: 'Member unmuted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create invite link
// @route   POST /api/chatrooms/:chatroomId/invite
// @access  Private
export const createInviteLink = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { expiresIn, maxUses } = req.body // expiresIn in hours

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    if (!chatroom.settings.allowInvites) {
      return res.status(403).json({ message: 'Invites are disabled for this chatroom' })
    }

    // Generate unique code
    const code = crypto.randomBytes(8).toString('hex')

    const inviteLink = {
      code,
      createdBy: req.user._id,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 60 * 60 * 1000) : null,
      maxUses: maxUses || null,
    }

    chatroom.inviteLinks.push(inviteLink)
    await chatroom.save()

    res.json({
      inviteLink: {
        ...inviteLink,
        url: `${process.env.CLIENT_URL}/chatrooms/join/${code}`,
      },
      message: 'Invite link created successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Join via invite link
// @route   POST /api/chatrooms/join/:code
// @access  Private
export const joinViaInvite = async (req, res) => {
  try {
    const { code } = req.params

    const chatroom = await Chatroom.findOne({ 'inviteLinks.code': code })
    if (!chatroom) {
      return res.status(404).json({ message: 'Invalid invite link' })
    }

    const invite = chatroom.inviteLinks.find(inv => inv.code === code)
    if (!invite || !invite.isActive) {
      return res.status(400).json({ message: 'Invite link is inactive' })
    }

    // Check expiration
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return res.status(400).json({ message: 'Invite link has expired' })
    }

    // Check max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(400).json({ message: 'Invite link has reached maximum uses' })
    }

    // Check if already member
    const isMember = chatroom.members.some(m => m.user.toString() === req.user._id.toString())
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' })
    }

    // Check if banned
    const isBanned = chatroom.bannedUsers.some(b => b.user.toString() === req.user._id.toString())
    if (isBanned) {
      return res.status(403).json({ message: 'You are banned from this chatroom' })
    }

    // Add member
    chatroom.members.push({
      user: req.user._id,
      role: 'member',
    })

    invite.uses += 1
    await chatroom.save()

    // Notify
    emitToRoom(req, `chatroom-${chatroom._id}`, 'member_joined', {
      user: req.user._id,
      userName: req.user.name,
    })

    res.json({ chatroom, message: 'Joined chatroom successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get chatroom members
// @route   GET /api/chatrooms/:chatroomId/members
// @access  Private
export const getChatroomMembers = async (req, res) => {
  try {
    const { chatroomId } = req.params

    const chatroom = await Chatroom.findById(chatroomId)
      .populate('members.user', 'name avatar email onlineStatus')
      .populate('moderators', 'name avatar')

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    res.json({
      members: chatroom.members,
      moderators: chatroom.moderators,
      total: chatroom.members.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
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
}
