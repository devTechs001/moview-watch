import mongoose from 'mongoose'

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
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
    enum: ['text', 'image', 'file', 'voice', 'video_call', 'audio_call'],
    default: 'text',
  },
  mediaUrl: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DirectMessage',
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
}, {
  timestamps: true,
})

// Index for faster queries
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })
directMessageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

// Create conversation index
directMessageSchema.index({
  sender: 1,
  recipient: 1,
  createdAt: -1
})

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema)
export default DirectMessage
