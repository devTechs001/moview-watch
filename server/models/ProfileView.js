import mongoose from 'mongoose'

const profileViewSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
})

// Index for faster queries
profileViewSchema.index({ profile: 1, createdAt: -1 })
profileViewSchema.index({ viewer: 1, profile: 1 })

const ProfileView = mongoose.model('ProfileView', profileViewSchema)
export default ProfileView
