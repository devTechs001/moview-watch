import mongoose from 'mongoose'

const socialConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'youtube', 'google'],
    required: true,
  },
  platformUserId: {
    type: String,
    required: true,
  },
  platformUsername: String,
  platformEmail: String,
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: String,
  tokenExpiry: Date,
  permissions: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSync: Date,
  syncSettings: {
    importPosts: { type: Boolean, default: false },
    exportPosts: { type: Boolean, default: false },
    syncProfile: { type: Boolean, default: false },
    autoPost: { type: Boolean, default: false },
  },
  profileData: {
    name: String,
    avatar: String,
    bio: String,
    followersCount: Number,
    followingCount: Number,
  },
}, {
  timestamps: true,
})

// Index for faster queries
socialConnectionSchema.index({ user: 1, platform: 1 }, { unique: true })
socialConnectionSchema.index({ platformUserId: 1, platform: 1 })

const SocialConnection = mongoose.model('SocialConnection', socialConnectionSchema)
export default SocialConnection
