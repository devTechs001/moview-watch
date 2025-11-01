import mongoose from 'mongoose'

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  album: {
    type: String,
    trim: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  genre: [{
    type: String,
    enum: ['pop', 'rock', 'jazz', 'classical', 'hip-hop', 'electronic', 'country', 'r&b', 'indie', 'other'],
  }],
  releaseYear: Number,
  lyrics: String,
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  plays: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'removed'],
    default: 'active',
  },
}, {
  timestamps: true,
})

// Indexes
musicSchema.index({ artist: 1, title: 1 })
musicSchema.index({ genre: 1, plays: -1 })
musicSchema.index({ status: 1, isPublic: 1 })

const Music = mongoose.model('Music', musicSchema)
export default Music
