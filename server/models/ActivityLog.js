import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'login', 'logout', 'register', 'password_change', 'password_reset',
      // Content actions
      'create_post', 'edit_post', 'delete_post', 'like_post', 'unlike_post',
      'create_comment', 'edit_comment', 'delete_comment',
      'create_story', 'view_story',
      // Movie actions
      'watch_movie', 'rate_movie', 'add_to_wishlist', 'remove_from_wishlist',
      'share_movie', 'download_movie',
      // Social actions
      'follow_user', 'unfollow_user', 'send_message', 'video_call',
      'join_chatroom', 'leave_chatroom',
      // Settings
      'update_profile', 'update_settings', 'change_password',
      // Subscription
      'subscribe', 'unsubscribe', 'payment_made',
      // Admin actions
      'admin_login', 'user_suspended', 'user_banned', 'content_removed',
      // System
      'api_call', 'error_occurred', 'suspicious_activity'
    ],
  },
  description: String,
  targetType: {
    type: String,
    enum: ['user', 'post', 'comment', 'movie', 'chatroom', 'subscription', 'system'],
  },
  targetId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  userAgent: String,
  device: {
    type: String,
    browser: String,
    os: String,
    device: String,
  },
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  sessionId: String,
  duration: Number, // in seconds
  metadata: mongoose.Schema.Types.Mixed,
  isAnomaly: {
    type: Boolean,
    default: false,
  },
  anomalyScore: {
    type: Number,
    min: 0,
    max: 1,
  },
  aiFlags: [{
    flag: String,
    confidence: Number,
    reason: String,
  }],
}, {
  timestamps: true,
})

// Indexes
activityLogSchema.index({ user: 1, createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })
activityLogSchema.index({ ipAddress: 1, createdAt: -1 })
activityLogSchema.index({ isAnomaly: 1, createdAt: -1 })
activityLogSchema.index({ sessionId: 1 })

// TTL index - auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
export default ActivityLog
