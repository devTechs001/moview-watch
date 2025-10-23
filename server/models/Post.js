import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'movie_share', 'review'],
    default: 'text',
  },
  media: [{
    type: String, // URL to media
  }],
  sharedMovie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
}, {
  timestamps: true,
})

// Index for faster queries
postSchema.index({ user: 1, createdAt: -1 })
postSchema.index({ visibility: 1, createdAt: -1 })
postSchema.index({ sharedMovie: 1 })

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length
})

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length
})

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length
})

postSchema.set('toJSON', { virtuals: true })
postSchema.set('toObject', { virtuals: true })

const Post = mongoose.model('Post', postSchema)
export default Post
