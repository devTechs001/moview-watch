import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one rating per user per movie
ratingSchema.index({ movie: 1, user: 1 }, { unique: true })

const Rating = mongoose.model('Rating', ratingSchema)

export default Rating
