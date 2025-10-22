import mongoose from 'mongoose'

const securityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'failed_login',
        'suspicious_activity',
        'rate_limit_exceeded',
        'unauthorized_access',
        'data_breach_attempt',
        'xss_attempt',
        'sql_injection_attempt',
        'ddos_pattern',
        'account_takeover_attempt',
        'unusual_behavior',
        'malware_detection',
        'api_abuse',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String,
    payload: mongoose.Schema.Types.Mixed,
    description: String,
    status: {
      type: String,
      enum: ['detected', 'investigating', 'resolved', 'false_positive', 'auto_fixed'],
      default: 'detected',
    },
    aiAnalysis: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      patterns: [String],
      recommendations: [String],
      autoFixApplied: {
        type: Boolean,
        default: false,
      },
      autoFixDetails: String,
    },
    resolution: {
      action: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
)

securityEventSchema.index({ createdAt: -1 })
securityEventSchema.index({ severity: 1, status: 1 })
securityEventSchema.index({ eventType: 1 })

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema)

export default SecurityEvent
