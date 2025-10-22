import mongoose from 'mongoose'

const socialActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['watched', 'liked', 'rated', 'commented', 'shared', 'added_to_wishlist', 'followed_user'],
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
)

socialActivitySchema.index({ user: 1, createdAt: -1 })
socialActivitySchema.index({ type: 1, createdAt: -1 })

const SocialActivity = mongoose.model('SocialActivity', socialActivitySchema)

export default SocialActivity
