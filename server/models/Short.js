import mongoose from 'mongoose'

const shortSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
    max: 60, // Shorts are max 60 seconds
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['comedy', 'action', 'drama', 'horror', 'music', 'dance', 'educational', 'other'],
    default: 'other',
  },
  tags: [String],
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  shares: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
})

// Indexes
shortSchema.index({ uploader: 1, createdAt: -1 })
shortSchema.index({ category: 1, views: -1 })
shortSchema.index({ status: 1, isPublic: 1 })

const Short = mongoose.model('Short', shortSchema)
export default Short
