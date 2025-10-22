import User from '../models/User.js'
import Movie from '../models/Movie.js'
import Comment from '../models/Comment.js'

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalMovies = await Movie.countDocuments()
    const totalViews = await Movie.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ])
    const totalComments = await Comment.countDocuments()

    res.json({
      totalUsers,
      totalMovies,
      totalViews: totalViews[0]?.total || 0,
      totalComments,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })

    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.role = req.body.role || user.role
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive

    const updatedUser = await user.save()

    res.json({ user: updatedUser })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.deleteOne()

    res.json({ message: 'User removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
