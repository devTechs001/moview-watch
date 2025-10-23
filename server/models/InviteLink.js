import mongoose from 'mongoose'
import crypto from 'crypto'

const inviteLinkSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(6).toString('hex'),
  },
  type: {
    type: String,
    enum: ['chatroom', 'movie', 'event', 'subscription', 'general'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['Chatroom', 'Movie', 'Event', 'Subscription'],
    required: true,
  },
  maxUses: {
    type: Number,
    default: null, // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null, // null = never expires
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  permissions: {
    canInviteOthers: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
  }],
  metadata: {
    title: String,
    description: String,
    thumbnail: String,
  },
}, {
  timestamps: true,
})

// Generate full invite URL
inviteLinkSchema.methods.getInviteUrl = function(baseUrl = 'http://localhost:5174') {
  return `${baseUrl}/invite/${this.code}`
}

// Check if link is valid
inviteLinkSchema.methods.isValid = function() {
  if (!this.isActive) return false
  if (this.expiresAt && new Date() > this.expiresAt) return false
  if (this.maxUses && this.usedCount >= this.maxUses) return false
  return true
}

// Increment usage
inviteLinkSchema.methods.use = async function(userId, ipAddress) {
  this.usedCount += 1
  this.usedBy.push({ user: userId, ipAddress })
  
  // Auto-deactivate if max uses reached
  if (this.maxUses && this.usedCount >= this.maxUses) {
    this.isActive = false
  }
  
  await this.save()
}

// Index for faster lookups
inviteLinkSchema.index({ code: 1 })
inviteLinkSchema.index({ type: 1, isActive: 1 })
inviteLinkSchema.index({ createdBy: 1 })
inviteLinkSchema.index({ expiresAt: 1 })

const InviteLink = mongoose.model('InviteLink', inviteLinkSchema)
export default InviteLink
