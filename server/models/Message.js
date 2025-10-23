import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'movie_share', 'system'],
    default: 'text',
  },
  mediaUrl: String,
  sharedContent: {
    contentType: String, // 'movie', 'story', 'post'
    contentId: mongoose.Schema.Types.ObjectId,
    title: String,
    thumbnail: String,
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
})

// Index for pagination
messageSchema.index({ chatroom: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)
export default Message
