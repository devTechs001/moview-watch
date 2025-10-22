import mongoose from 'mongoose'

const aiLearningSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['security', 'user_behavior', 'content_recommendation', 'performance', 'anomaly_detection'],
      required: true,
    },
    learningType: {
      type: String,
      enum: ['pattern_recognition', 'anomaly_detection', 'prediction', 'optimization'],
      required: true,
    },
    dataPoints: [
      {
        timestamp: Date,
        features: mongoose.Schema.Types.Mixed,
        outcome: String,
        confidence: Number,
      },
    ],
    patterns: [
      {
        name: String,
        description: String,
        frequency: Number,
        accuracy: Number,
        lastSeen: Date,
      },
    ],
    models: {
      version: String,
      accuracy: Number,
      lastTrained: Date,
      trainingDataSize: Number,
      parameters: mongoose.Schema.Types.Mixed,
    },
    insights: [
      {
        type: String,
        description: String,
        confidence: Number,
        actionable: Boolean,
        implemented: Boolean,
        createdAt: Date,
      },
    ],
    performance: {
      successRate: Number,
      falsePositiveRate: Number,
      falseNegativeRate: Number,
      averageResponseTime: Number,
    },
  },
  {
    timestamps: true,
  }
)

const AILearning = mongoose.model('AILearning', aiLearningSchema)

export default AILearning
