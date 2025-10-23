import mongoose from 'mongoose'

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['private', 'public', 'group'],
    default: 'public',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  avatar: {
    type: String,
    default: '',
  },
  lastMessage: {
    text: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: Date,
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    maxMembers: {
      type: Number,
      default: 100,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index for faster queries
chatroomSchema.index({ type: 1, isActive: 1 })
chatroomSchema.index({ 'members.user': 1 })

const Chatroom = mongoose.model('Chatroom', chatroomSchema)
export default Chatroom
