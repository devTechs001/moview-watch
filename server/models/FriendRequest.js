import mongoose from 'mongoose'

const friendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
})

// Index for faster queries
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true })
friendRequestSchema.index({ to: 1, status: 1 })

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema)
export default FriendRequest
