import mongoose from 'mongoose'

const aiSettingsSchema = new mongoose.Schema({
  feature: {
    type: String,
    enum: ['learning', 'assistant', 'recommendations', 'moderation', 'analytics'],
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  performance: {
    accuracy: Number,
    responseTime: Number,
    userSatisfaction: Number,
  },
}, {
  timestamps: true,
})

const AISettings = mongoose.model('AISettings', aiSettingsSchema)
export default AISettings
