import Chatroom from '../models/Chatroom.js'
import Message from '../models/Message.js'

// Get all public chatrooms
export const getPublicChatrooms = async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({ type: 'public', isActive: true })
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(50)

    res.json({ chatrooms })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chatrooms', error: error.message })
  }
}

// Get user's chatrooms
export const getUserChatrooms = async (req, res) => {
  try {
    const chatrooms = await Chatroom.find({
      'members.user': req.user._id,
      isActive: true,
    })
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('lastMessage.sender', 'name avatar')
      .sort({ updatedAt: -1 })

    res.json({ chatrooms })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user chatrooms', error: error.message })
  }
}

// Get single chatroom
export const getChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const chatroom = await Chatroom.findById(chatroomId)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('lastMessage.sender', 'name avatar')

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    res.json({ chatroom })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chatroom', error: error.message })
  }
}

// Create chatroom
export const createChatroom = async (req, res) => {
  try {
    const { name, description, type, avatar } = req.body

    const chatroom = await Chatroom.create({
      name,
      description,
      type,
      avatar,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
      }],
    })

    await chatroom.populate('creator', 'name avatar')

    // Emit socket event
    emitSocketEvent(req, 'chatroom_created', {
      chatroom,
      creator: req.user._id,
      timestamp: new Date(),
    })

    res.status(201).json({ chatroom })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create chatroom', error: error.message })
  }
}

// Join chatroom
export const joinChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const chatroom = await Chatroom.findById(chatroomId)

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check if already a member
    const isMember = chatroom.members.some(m => m.user.toString() === req.user._id.toString())
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' })
    }

    // Check if private and requires approval
    if (chatroom.type === 'private' && chatroom.settings.requireApproval) {
      return res.status(403).json({ message: 'This chatroom requires approval to join' })
    }

    // Add member
    chatroom.members.push({
      user: req.user._id,
      role: 'member',
    })

    await chatroom.save()
    await chatroom.populate('members.user', 'name avatar')

    // Emit socket event
    const io = req.app.get('io')
    io.to(chatroomId).emit('member_joined', {
      chatroomId,
      user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
    })

    res.json({ chatroom, message: 'Joined chatroom successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to join chatroom', error: error.message })
  }
}

// Leave chatroom
export const leaveChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const chatroom = await Chatroom.findById(chatroomId)

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    chatroom.members = chatroom.members.filter(
      m => m.user.toString() !== req.user._id.toString()
    )

    await chatroom.save()

    // Emit socket event
    const io = req.app.get('io')
    io.to(chatroomId).emit('member_left', {
      chatroomId,
      userId: req.user._id,
    })

    res.json({ message: 'Left chatroom successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave chatroom', error: error.message })
  }
}

// Get chatroom messages
export const getChatroomMessages = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { page = 1, limit = 50 } = req.query

    const messages = await Message.find({ chatroom: chatroomId })
      .populate('sender', 'name avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Message.countDocuments({ chatroom: chatroomId })

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message })
  }
}

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const { content, type, mediaUrl, sharedContent, replyTo } = req.body

    const chatroom = await Chatroom.findById(chatroomId)
    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check if user is a member
    const isMember = chatroom.members.some(m => m.user.toString() === req.user._id.toString())
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this chatroom' })
    }

    const message = await Message.create({
      chatroom: chatroomId,
      sender: req.user._id,
      content,
      type,
      mediaUrl,
      sharedContent,
      replyTo,
    })

    await message.populate('sender', 'name avatar')

    // Update chatroom last message
    chatroom.lastMessage = {
      text: content,
      sender: req.user._id,
      timestamp: new Date(),
    }
    await chatroom.save()

    // Emit socket event
    const io = req.app.get('io')
    io.to(chatroomId).emit('new_message', message)

    res.status(201).json({ message })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message })
  }
}

// React to message
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body

    const message = await Message.findById(messageId)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Remove existing reaction if any
    message.reactions = message.reactions.filter(
      r => r.user.toString() !== req.user._id.toString()
    )

    // Add new reaction
    if (emoji) {
      message.reactions.push({
        user: req.user._id,
        emoji,
      })
    }

    await message.save()

    // Emit socket event
    const io = req.app.get('io')
    io.to(message.chatroom.toString()).emit('message_reaction', {
      messageId,
      userId: req.user._id,
      emoji,
    })

    res.json({ message })
  } catch (error) {
    res.status(500).json({ message: 'Failed to react', error: error.message })
  }
}

// Delete chatroom (admin only)
export const deleteChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.params
    const chatroom = await Chatroom.findById(chatroomId)

    if (!chatroom) {
      return res.status(404).json({ message: 'Chatroom not found' })
    }

    // Check if user is creator
    if (chatroom.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete chatroom' })
    }

    chatroom.isActive = false
    await chatroom.save()

    // Emit socket event
    const io = req.app.get('io')
    io.to(chatroomId).emit('chatroom_deleted', { chatroomId })

    res.json({ message: 'Chatroom deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete chatroom', error: error.message })
  }
}
