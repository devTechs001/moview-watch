import Comment from '../models/Comment.js'
import User from '../models/User.js'
import ActivityLog from '../models/ActivityLog.js'
import AIMonitoring from '../models/AIMonitoring.js'
import Post from '../models/Post.js'
import { emitToRoom } from '../utils/socket.js'

// @desc    Get real-time comments
// @route   GET /api/admin/realtime/comments
// @access  Private/Admin
export const getRealtimeComments = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query

    const comments = await Comment.find()
      .populate('user', 'name avatar')
      .populate('movie', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Comment.countDocuments()

    res.json({ 
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get real-time users activity
// @route   GET /api/admin/realtime/users
// @access  Private/Admin
export const getRealtimeUsers = async (req, res) => {
  try {
    const { limit = 50 } = req.query

    // Get online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const onlineUsers = await User.find({
      'onlineStatus.lastSeen': { $gte: fiveMinutesAgo }
    }).select('name avatar email onlineStatus').limit(parseInt(limit))

    // Get recent registrations
    const recentUsers = await User.find()
      .select('name avatar email createdAt')
      .sort({ createdAt: -1 })
      .limit(10)

    // Get user activity stats
    const totalUsers = await User.countDocuments()
    const activeToday = await User.countDocuments({
      'onlineStatus.lastSeen': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    res.json({
      onlineUsers,
      onlineCount: onlineUsers.length,
      recentUsers,
      stats: {
        total: totalUsers,
        activeToday,
        onlineNow: onlineUsers.length,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get real-time analytics
// @route   GET /api/admin/realtime/analytics
// @access  Private/Admin
export const getRealtimeAnalytics = async (req, res) => {
  try {
    const now = new Date()
    const oneHourAgo = new Date(now - 60 * 60 * 1000)
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)

    // Activity in last hour
    const recentActivity = await ActivityLog.find({
      createdAt: { $gte: oneHourAgo }
    }).populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50)

    // Activity breakdown
    const activityBreakdown = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Posts in last 24 hours
    const recentPosts = await Post.countDocuments({
      createdAt: { $gte: oneDayAgo }
    })

    // Comments in last 24 hours
    const recentComments = await Comment.countDocuments({
      createdAt: { $gte: oneDayAgo }
    })

    res.json({
      recentActivity,
      activityBreakdown,
      last24Hours: {
        posts: recentPosts,
        comments: recentComments,
        totalActivity: recentActivity.length,
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get AI security threats
// @route   GET /api/admin/realtime/security
// @access  Private/Admin
export const getRealtimeSecurity = async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const threats = await AIMonitoring.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Count by severity
    const severityCounts = await AIMonitoring.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ])

    // Count by type
    const typeCounts = await AIMonitoring.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])

    res.json({
      threats,
      severityCounts,
      typeCounts,
      total: threats.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get system logs
// @route   GET /api/admin/realtime/logs
// @access  Private/Admin
export const getRealtimeLogs = async (req, res) => {
  try {
    const { limit = 100, type } = req.query

    const query = {}
    if (type) {
      query.action = type
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    res.json({ logs })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user reports
// @route   GET /api/admin/realtime/reports
// @access  Private/Admin
export const getRealtimeReports = async (req, res) => {
  try {
    // This would require a Report model
    // For now, return flagged content from AI monitoring
    const reports = await AIMonitoring.find({
      category: { $in: ['content', 'user_report'] }
    })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ reports })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Stream live activity (SSE)
// @route   GET /api/admin/realtime/stream
// @access  Private/Admin
export const streamLiveActivity = async (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Live stream started' })}\n\n`)

  // Set up interval to send updates
  const interval = setInterval(async () => {
    try {
      // Get recent activity
      const recentActivity = await ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('user', 'name')

      if (recentActivity.length > 0) {
        res.write(`data: ${JSON.stringify({
          type: 'activity',
          data: recentActivity[0]
        })}\n\n`)
      }
    } catch (error) {
      console.error('Stream error:', error)
    }
  }, 5000) // Send update every 5 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
}

export default {
  getRealtimeComments,
  getRealtimeUsers,
  getRealtimeAnalytics,
  getRealtimeSecurity,
  getRealtimeLogs,
  getRealtimeReports,
  streamLiveActivity,
}
