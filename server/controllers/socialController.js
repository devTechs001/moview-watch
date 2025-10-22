import Story from '../models/Story.js'
import SocialActivity from '../models/SocialActivity.js'
import User from '../models/User.js'

// @desc    Create story
// @route   POST /api/social/stories
// @access  Private
export const createStory = async (req, res) => {
  try {
    const story = await Story.create({
      user: req.user._id,
      ...req.body,
    })

    const populatedStory = await Story.findById(story._id).populate('user', 'name avatar')

    res.status(201).json({ story: populatedStory })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all active stories
// @route   GET /api/social/stories
// @access  Private
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'name avatar')
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString()
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        }
      }
      acc[userId].stories.push(story)
      return acc
    }, {})

    res.json({ stories: Object.values(groupedStories) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    View story
// @route   POST /api/social/stories/:id/view
// @access  Private
export const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)

    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }

    const alreadyViewed = story.views.some(
      (view) => view.user.toString() === req.user._id.toString()
    )

    if (!alreadyViewed) {
      story.views.push({ user: req.user._id })
      await story.save()
    }

    res.json({ views: story.views.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like story
// @route   POST /api/social/stories/:id/like
// @access  Private
export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)

    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }

    const alreadyLiked = story.likes.includes(req.user._id)

    if (alreadyLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== req.user._id.toString())
    } else {
      story.likes.push(req.user._id)
    }

    await story.save()

    res.json({ likes: story.likes.length, liked: !alreadyLiked })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get social activity feed
// @route   GET /api/social/feed
// @access  Private
export const getSocialFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const activities = await SocialActivity.find({
      visibility: { $in: ['public', 'followers'] },
    })
      .populate('user', 'name avatar')
      .populate('movie', 'title poster')
      .populate('targetUser', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await SocialActivity.countDocuments({
      visibility: { $in: ['public', 'followers'] },
    })

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create social activity
// @route   POST /api/social/activity
// @access  Private
export const createActivity = async (req, res) => {
  try {
    const activity = await SocialActivity.create({
      user: req.user._id,
      ...req.body,
    })

    res.status(201).json({ activity })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user's social profile
// @route   GET /api/social/profile/:userId
// @access  Private
export const getUserSocialProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('wishlist')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const activities = await SocialActivity.find({ user: req.params.userId })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .limit(50)

    const stats = {
      moviesWatched: user.watchHistory.length,
      wishlistCount: user.wishlist.length,
      totalLikes: await SocialActivity.countDocuments({
        user: req.params.userId,
        type: 'liked',
      }),
      totalRatings: await SocialActivity.countDocuments({
        user: req.params.userId,
        type: 'rated',
      }),
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
      stats,
      recentActivities: activities,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
