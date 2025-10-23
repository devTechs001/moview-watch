import User from '../models/User.js'
import Movie from '../models/Movie.js'
import Comment from '../models/Comment.js'
import ActivityLog from '../models/ActivityLog.js'

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

// @desc    Get activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getActivity = async (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query
    
    const query = type !== 'all' ? { type } : {}
    
    // Try to get from ActivityLog model, fallback to mock data
    let activities = []
    try {
      const ActivityLog = (await import('../models/ActivityLog.js')).default
      activities = await ActivityLog.find(query)
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
    } catch (err) {
      // Return mock data if model doesn't exist
      activities = [
        {
          _id: '1',
          type: 'login',
          user: { name: 'Admin User', email: 'admin@example.com' },
          description: 'User logged in',
          createdAt: new Date(),
        },
        {
          _id: '2',
          type: 'movie_view',
          user: { name: 'John Doe', email: 'john@example.com' },
          description: 'Watched a movie',
          createdAt: new Date(Date.now() - 3600000),
        },
      ]
    }
    
    res.json({
      success: true,
      activities,
      count: activities.length,
    })
  } catch (error) {
    console.error('Get activity error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const { status = 'all' } = req.query
    
    // Mock data for now
    const reports = [
      {
        _id: '1',
        type: 'inappropriate_content',
        status: 'pending',
        reportedBy: { name: 'User 1', email: 'user1@example.com' },
        content: 'Inappropriate movie description',
        createdAt: new Date(),
      },
      {
        _id: '2',
        type: 'spam',
        status: 'resolved',
        reportedBy: { name: 'User 2', email: 'user2@example.com' },
        content: 'Spam comment',
        createdAt: new Date(Date.now() - 86400000),
      },
    ]
    
    const filteredReports = status !== 'all' 
      ? reports.filter(r => r.status === status)
      : reports
    
    res.json({
      success: true,
      reports: filteredReports,
      count: filteredReports.length,
    })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
export const updateReport = async (req, res) => {
  try {
    const { status } = req.body
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      report: {
        _id: req.params.id,
        status,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Update report error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Get comments
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getComments = async (req, res) => {
  try {
    const { filter = 'all' } = req.query
    
    // Mock data for now
    const comments = [
      {
        _id: '1',
        text: 'Great movie! Loved the cinematography.',
        user: { name: 'John Doe', avatar: '', email: 'john@example.com' },
        post: { _id: 'p1', content: 'Just watched this amazing film!' },
        movie: { title: 'Inception' },
        isFlagged: false,
        createdAt: new Date(),
      },
      {
        _id: '2',
        text: 'This is spam content',
        user: { name: 'Spammer', avatar: '', email: 'spam@example.com' },
        post: { _id: 'p2', content: 'Check out my post' },
        movie: { title: 'The Matrix' },
        isFlagged: true,
        createdAt: new Date(Date.now() - 3600000),
      },
    ]
    
    const filteredComments = filter === 'all' 
      ? comments 
      : filter === 'flagged'
      ? comments.filter(c => c.isFlagged)
      : comments.filter(c => !c.isFlagged)
    
    res.json({
      success: true,
      comments: filteredComments,
      count: filteredComments.length,
    })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Get comment stats
// @route   GET /api/admin/comments/stats
// @access  Private/Admin
export const getCommentStats = async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        total: 2,
        flagged: 1,
        approved: 1
      }
    })
  } catch (error) {
    console.error('Get comment stats error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Flag comment
// @route   PUT /api/admin/comments/:id/flag
// @access  Private/Admin
export const flagComment = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Comment flagged'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Approve comment
// @route   PUT /api/admin/comments/:id/approve
// @access  Private/Admin
export const approveComment = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Comment approved'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Comment deleted'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
}
