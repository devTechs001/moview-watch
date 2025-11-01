import mongoose from 'mongoose'

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['public', 'private', 'direct'],
    default: 'public',
  },
  avatar: {
    type: String,
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member',
      },
      permissions: {
        canSendMessages: { type: Boolean, default: true },
        canDeleteMessages: { type: Boolean, default: false },
        canKickMembers: { type: Boolean, default: false },
        canBanMembers: { type: Boolean, default: false },
        canEditRoom: { type: Boolean, default: false },
        canManageRoles: { type: Boolean, default: false },
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      isMuted: {
        type: Boolean,
        default: false,
      },
      mutedUntil: Date,
    },
  ],
  moderators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  bannedUsers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      bannedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  inviteLinks: [
    {
      code: {
        type: String,
        unique: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      expiresAt: Date,
      maxUses: Number,
      uses: {
        type: Number,
        default: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
  settings: {
    allowInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 100 },
    allowVoiceCalls: { type: Boolean, default: true },
    allowVideoCalls: { type: Boolean, default: true },
    allowFileSharing: { type: Boolean, default: true },
  },
  lastMessage: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    timestamp: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Index for faster queries
chatroomSchema.index({ type: 1, isActive: 1 })
chatroomSchema.index({ 'members.user': 1 })

const Chatroom = mongoose.model('Chatroom', chatroomSchema)
export default Chatroom
