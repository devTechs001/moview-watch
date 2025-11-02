import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'tv', 'animation', 'short_film', 'documentary'],
      default: 'movie'
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    poster: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
    },
    trailer: {
      type: String,
    },
    // videoUrl was previously required which caused imports/seeds without
    // a real video url to fail on startup. Make it optional and default to
    // an empty string so records can be created and updated later.
    videoUrl: {
      type: String,
      required: false,
      default: '',
    },
    year: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    director: {
      type: String,
      required: true,
    },
    cast: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['manual', 'tmdb', 'omdb', 'imdb', 'trakt', 'tvmaze'],
      default: 'manual',
    },
    externalId: {
      tmdb: String,
      imdb: String,
      omdb: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for search
movieSchema.index({ title: 'text', description: 'text' })

const Movie = mongoose.model('Movie', movieSchema)

export default Movie
