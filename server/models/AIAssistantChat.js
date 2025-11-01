import mongoose from 'mongoose'

const aiAssistantChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  }],
  context: {
    currentPage: String,
    userIntent: String,
    movieContext: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
}, {
  timestamps: true,
})

// Indexes
aiAssistantChatSchema.index({ user: 1, createdAt: -1 })
aiAssistantChatSchema.index({ isActive: 1 })

const AIAssistantChat = mongoose.model('AIAssistantChat', aiAssistantChatSchema)
export default AIAssistantChat
