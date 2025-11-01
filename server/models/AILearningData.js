import mongoose from 'mongoose'

const aiLearningDataSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['user_behavior', 'content_preference', 'security_pattern', 'interaction', 'feedback', 'error', 'performance'],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  context: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    route: String,
    action: String,
  },
  insights: {
    type: mongoose.Schema.Types.Mixed,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  appliedToModel: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Indexes
aiLearningDataSchema.index({ category: 1, createdAt: -1 })
aiLearningDataSchema.index({ 'context.userId': 1 })
aiLearningDataSchema.index({ processed: 1 })

const AILearningData = mongoose.model('AILearningData', aiLearningDataSchema)
export default AILearningData
