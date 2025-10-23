import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Social
      'like', 'comment', 'follow', 'mention', 'message', 'video_call',
      // Content
      'new_movie', 'movie_recommendation', 'story_viewed',
      // System
      'system_alert', 'security_alert', 'breach_detected',
      // Subscription
      'subscription_expiring', 'payment_successful', 'payment_failed',
      // AI Monitoring
      'content_flagged', 'unusual_activity', 'login_from_new_device',
      // Updates
      'app_update', 'feature_announcement'
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  icon: String,
  image: String,
  link: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['social', 'content', 'system', 'security', 'subscription', 'update'],
    default: 'system',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  channels: {
    inApp: {
      type: Boolean,
      default: true,
    },
    email: {
      sent: Boolean,
      sentAt: Date,
      error: String,
    },
    push: {
      sent: Boolean,
      sentAt: Date,
      error: String,
    },
    sms: {
      sent: Boolean,
      sentAt: Date,
      error: String,
    },
  },
  actionRequired: {
    type: Boolean,
    default: false,
  },
  actions: [{
    label: String,
    action: String, // 'link', 'dismiss', 'accept', 'decline'
    url: String,
    primary: Boolean,
  }],
  metadata: mongoose.Schema.Types.Mixed,
  expiresAt: Date,
}, {
  timestamps: true,
})

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ type: 1, createdAt: -1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Auto-expire notifications after 30 days
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  next()
})

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
