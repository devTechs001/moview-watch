import mongoose from 'mongoose'

const aiMonitoringSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['content', 'user_activity', 'login', 'breach', 'system', 'performance'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  category: {
    type: String,
    enum: [
      'spam', 'inappropriate_content', 'hate_speech', 'violence',
      'suspicious_activity', 'multiple_failed_logins', 'unusual_location',
      'brute_force', 'sql_injection', 'xss_attempt', 'ddos',
      'data_leak', 'unauthorized_access', 'malware'
    ],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  contentType: {
    type: String,
    enum: ['post', 'comment', 'message', 'movie', 'profile', 'chat'],
  },
  contentId: mongoose.Schema.Types.ObjectId,
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  description: {
    type: String,
    required: true,
  },
  detectedPatterns: [{
    pattern: String,
    confidence: Number, // 0-1
    evidence: String,
  }],
  aiAnalysis: {
    model: String, // e.g., 'gpt-4', 'content-moderator'
    confidence: Number, // 0-1
    reasoning: String,
    suggestions: [String],
  },
  status: {
    type: String,
    enum: ['detected', 'reviewing', 'resolved', 'false_positive', 'confirmed'],
    default: 'detected',
  },
  actionTaken: {
    type: String,
    enum: [
      'none', 'warning_sent', 'content_removed', 'user_suspended',
      'user_banned', 'ip_blocked', 'auto_fixed', 'escalated'
    ],
    default: 'none',
  },
  autoFixed: {
    type: Boolean,
    default: false,
  },
  fixDetails: {
    method: String,
    appliedAt: Date,
    success: Boolean,
    error: String,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  notificationDetails: {
    sentTo: [String], // user IDs or 'admin'
    sentAt: Date,
    channels: [String], // 'email', 'push', 'sms', 'in-app'
  },
  metadata: mongoose.Schema.Types.Mixed,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  reviewNotes: String,
}, {
  timestamps: true,
})

// Indexes for fast queries
aiMonitoringSchema.index({ type: 1, severity: 1, createdAt: -1 })
aiMonitoringSchema.index({ user: 1, createdAt: -1 })
aiMonitoringSchema.index({ status: 1, severity: 1 })
aiMonitoringSchema.index({ category: 1, createdAt: -1 })

const AIMonitoring = mongoose.model('AIMonitoring', aiMonitoringSchema)
export default AIMonitoring
