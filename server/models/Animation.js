import mongoose from 'mongoose'

const animationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['series', 'movie', 'short'],
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  trailer: String,
  duration: Number, // in minutes
  episodes: [{
    episodeNumber: Number,
    title: String,
    description: String,
    videoUrl: String,
    duration: Number,
    thumbnail: String,
    airDate: Date,
  }],
  seasons: [{
    seasonNumber: Number,
    title: String,
    episodes: Number,
    releaseYear: Number,
  }],
  genre: [{
    type: String,
    enum: ['action', 'comedy', 'adventure', 'fantasy', 'sci-fi', 'slice-of-life', 'romance', 'horror', 'mystery', 'other'],
  }],
  studio: String,
  releaseYear: Number,
  ageRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', '18+'],
    default: 'PG',
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  cast: [String],
  director: String,
  tags: [String],
  language: {
    type: String,
    default: 'English',
  },
  subtitles: [{
    language: String,
    url: String,
  }],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'upcoming'],
    default: 'completed',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
animationSchema.index({ type: 1, genre: 1 })
animationSchema.index({ rating: -1, views: -1 })
animationSchema.index({ status: 1, isPublic: 1 })

const Animation = mongoose.model('Animation', animationSchema)
export default Animation
