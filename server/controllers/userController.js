import User from '../models/User.js'
import Movie from '../models/Movie.js'

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist')

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.bio = req.body.bio || user.bio
      user.location = req.body.location || user.location
      user.avatar = req.body.avatar || user.avatar

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist')

    res.json({ wishlist: user.wishlist })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add to wishlist
// @route   POST /api/user/wishlist/:movieId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const movie = await Movie.findById(req.params.movieId)

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    if (user.wishlist.includes(req.params.movieId)) {
      return res.status(400).json({ message: 'Movie already in wishlist' })
    }

    user.wishlist.push(req.params.movieId)
    await user.save()

    res.json({ message: 'Added to wishlist' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove from wishlist
// @route   DELETE /api/user/wishlist/:movieId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== req.params.movieId
    )

    await user.save()

    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add to watch history
// @route   POST /api/user/history/:movieId
// @access  Private
export const addToHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.watchHistory.push({
      movie: req.params.movieId,
      watchedAt: new Date(),
    })

    await user.save()

    res.json({ message: 'Added to history' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
