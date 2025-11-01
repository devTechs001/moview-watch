import User from '../models/User.js'
import ProfileView from '../models/ProfileView.js'
import Post from '../models/Post.js'

// @desc    Track profile view
// @route   POST /api/profile/:userId/view
// @access  Private/Public
export const trackProfileView = async (req, res) => {
  try {
    const { userId } = req.params
    const viewerId = req.user?._id

    // Don't track own profile views
    if (viewerId && viewerId.toString() === userId) {
      return res.json({ message: 'Own profile view not tracked' })
    }

    // Create profile view
    await ProfileView.create({
      profile: userId,
      viewer: viewerId,
      anonymous: !viewerId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    // Update profile view count
    await User.findByIdAndUpdate(userId, {
      $inc: { profileViewCount: 1 },
    })

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io && viewerId) {
      io.to(userId).emit('profile_viewed', {
        viewer: viewerId,
        viewerName: req.user.name,
      })
    }

    res.json({ message: 'Profile view tracked' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get profile views
// @route   GET /api/profile/views
// @access  Private
export const getProfileViews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const views = await ProfileView.find({ profile: req.user._id })
      .populate('viewer', 'name avatar bio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await ProfileView.countDocuments({ profile: req.user._id })

    res.json({
      views,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/profile/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', 'name avatar bio')
      .populate('followers', 'name avatar bio')
      .populate('following', 'name avatar bio')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check privacy settings
    if (user.preferences.privacy.profileVisibility === 'private' && 
        (!req.user || req.user._id.toString() !== userId)) {
      return res.status(403).json({ message: 'Profile is private' })
    }

    // Get user's posts
    const posts = await Post.find({ user: userId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10)

    // Check if current user is friends with profile user
    let friendshipStatus = 'none'
    if (req.user) {
      if (user.friends.some(f => f._id.toString() === req.user._id.toString())) {
        friendshipStatus = 'friends'
      }
    }

    res.json({ 
      user,
      posts,
      friendshipStatus,
      stats: {
        postsCount: await Post.countDocuments({ user: userId }),
        friendsCount: user.friends.length,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body

    // Don't allow updating certain fields
    delete updates.email
    delete updates.password
    delete updates.role
    delete updates.friends
    delete updates.followers
    delete updates.following

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update profile settings
// @route   PUT /api/profile/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const { preferences, visibility, contactInfo } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(preferences && { preferences }),
        ...(visibility && { visibility }),
        ...(contactInfo && { contactInfo }),
      },
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ user, message: 'Settings updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  trackProfileView,
  getProfileViews,
  getUserProfile,
  updateProfile,
  updateSettings,
}
