import DirectMessage from '../models/DirectMessage.js'
import User from '../models/User.js'

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar'
          },
          lastMessage: 1,
          unreadCount: 1,
          lastActivity: '$lastMessage.createdAt'
        }
      },
      {
        $sort: { lastActivity: -1 }
      }
    ])

    res.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message })
  }
}

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 50 } = req.query

    // Mark messages as read
    await DirectMessage.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    )

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message })
  }
}

// Send a direct message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, type = 'text', mediaUrl } = req.body

    // Check if recipient exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    const message = await DirectMessage.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
      type,
      mediaUrl,
    })

    // Populate sender info
    await message.populate('sender', 'name avatar')

    // Emit Socket.io event
    const io = req.app.get('io')
    io.to(recipientId).emit('receive-message', {
      message,
      sender: message.sender,
    })

    // Mark as delivered
    message.isDelivered = true
    message.deliveredAt = new Date()
    await message.save()

    res.status(201).json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Failed to send message', error: error.message })
  }
}

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params

    await DirectMessage.updateMany(
      {
        sender: senderId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    )

    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ message: 'Failed to mark messages as read', error: error.message })
  }
}

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params

    const message = await DirectMessage.findById(messageId)

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== req.user._id.toString() &&
        message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await message.deleteOne()

    res.json({ message: 'Message deleted' })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ message: 'Failed to delete message', error: error.message })
  }
}

// Get online users (for chat status)
export const getOnlineUsers = async (req, res) => {
  try {
    // This would typically come from Socket.io connected users
    // For now, return a simulated list
    const onlineUsers = await User.find({
      _id: { $ne: req.user._id },
      lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })
    .select('name avatar email lastSeen')

    res.json({ onlineUsers })
  } catch (error) {
    console.error('Get online users error:', error)
    res.status(500).json({ message: 'Failed to fetch online users', error: error.message })
  }
}

// Start video call
export const startVideoCall = async (req, res) => {
  try {
    const { recipientId } = req.body

    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    // Create video call message
    const callMessage = await DirectMessage.create({
      sender: req.user._id,
      recipient: recipientId,
      content: '📹 Video call started',
      type: 'video_call',
    })

    // Emit Socket.io event for incoming call
    const io = req.app.get('io')
    io.to(recipientId).emit('incoming-video-call', {
      callId: callMessage._id,
      caller: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
      callType: 'video',
    })

    res.status(201).json({
      message: 'Video call initiated',
      callId: callMessage._id
    })
  } catch (error) {
    console.error('Start video call error:', error)
    res.status(500).json({ message: 'Failed to start video call', error: error.message })
  }
}

// Start audio call
export const startAudioCall = async (req, res) => {
  try {
    const { recipientId } = req.body

    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    // Create audio call message
    const callMessage = await DirectMessage.create({
      sender: req.user._id,
      recipient: recipientId,
      content: '📞 Audio call started',
      type: 'audio_call',
    })

    // Emit Socket.io event for incoming call
    const io = req.app.get('io')
    io.to(recipientId).emit('incoming-audio-call', {
      callId: callMessage._id,
      caller: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
      callType: 'audio',
    })

    res.status(201).json({
      message: 'Audio call initiated',
      callId: callMessage._id
    })
  } catch (error) {
    console.error('Start audio call error:', error)
    res.status(500).json({ message: 'Failed to start audio call', error: error.message })
  }
}

// Search users for chat
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query

    if (!query || query.length < 2) {
      return res.json({ users: [] })
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }
      ]
    })
    .select('name email avatar')
    .limit(10)

    res.json({ users })
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Failed to search users', error: error.message })
  }
}

export default {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getOnlineUsers,
  startVideoCall,
  startAudioCall,
  searchUsers,
}
