import AIMonitoring from '../models/AIMonitoring.js'
import ActivityLog from '../models/ActivityLog.js'
import Notification from '../models/Notification.js'
// AI monitoring service - using direct models instead
// import { moderateContent } from '../services/aiMonitoringService.js'

// Get all monitoring alerts
export const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, severity, status } = req.query

    const query = {}
    if (type) query.type = type
    if (severity) query.severity = severity
    if (status) query.status = status

    const alerts = await AIMonitoring.find(query)
      .populate('user', 'name email avatar')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await AIMonitoring.countDocuments(query)

    res.json({
      alerts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message })
  }
}

// Get alert details
export const getAlertDetails = async (req, res) => {
  try {
    const alert = await AIMonitoring.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('targetUser', 'name email')
      .populate('reviewedBy', 'name email')

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    res.json({ alert })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alert', error: error.message })
  }
}

// Review and resolve alert
export const resolveAlert = async (req, res) => {
  try {
    const { status, action, notes } = req.body
    const alert = await AIMonitoring.findById(req.params.id)

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    alert.status = status
    if (action) alert.actionTaken = action
    alert.reviewedBy = req.user._id
    alert.reviewedAt = new Date()
    if (notes) alert.reviewNotes = notes

    await alert.save()

    res.json({ alert, message: 'Alert resolved successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve alert', error: error.message })
  }
}

// Get monitoring statistics
export const getStatistics = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query
    const days = parseInt(timeRange)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const stats = {
      totalAlerts: await AIMonitoring.countDocuments({ createdAt: { $gte: startDate } }),
      byType: await AIMonitoring.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      bySeverity: await AIMonitoring.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      byStatus: await AIMonitoring.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      autoFixed: await AIMonitoring.countDocuments({
        createdAt: { $gte: startDate },
        autoFixed: true,
      }),
      pendingReview: await AIMonitoring.countDocuments({
        status: 'reviewing',
      }),
    }

    // Activity statistics
    stats.activities = {
      total: await ActivityLog.countDocuments({ createdAt: { $gte: startDate } }),
      anomalies: await ActivityLog.countDocuments({
        createdAt: { $gte: startDate },
        isAnomaly: true,
      }),
      byAction: await ActivityLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    }

    res.json({ stats })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message })
  }
}

// Get user activity logs
export const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 50, action } = req.query

    const query = { user: userId }
    if (action) query.action = action

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await ActivityLog.countDocuments(query)

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity logs', error: error.message })
  }
}

// Manually trigger content moderation
export const moderateContentManual = async (req, res) => {
  try {
    const { content, contentType, contentId } = req.body

    // Simple inline moderation
    const inappropriatePatterns = [
      /\b(spam|scam|fake)\b/gi,
      /\b(hate|racist|offensive)\b/gi,
      /<script|javascript:|onerror=/gi,
    ]

    let isInappropriate = false
    const flags = []

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(content)) {
        isInappropriate = true
        flags.push(pattern.toString())
      }
    }

    if (isInappropriate) {
      await AIMonitoring.create({
        type: 'content',
        severity: 'medium',
        category: 'manual_review',
        user: req.user._id,
        contentType,
        contentId,
        description: 'Content flagged by manual moderation',
        detectedPatterns: flags,
      })
    }

    res.json({
      result: { isInappropriate, flags },
      message: isInappropriate ? 'Content flagged' : 'Content approved',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get system health
export const getSystemHealth = async (req, res) => {
  try {
    const now = new Date()
    const oneHourAgo = new Date(now - 60 * 60 * 1000)

    const health = {
      status: 'healthy',
      timestamp: now,
      metrics: {
        criticalAlerts: await AIMonitoring.countDocuments({
          severity: 'critical',
          status: { $in: ['detected', 'reviewing'] },
          createdAt: { $gte: oneHourAgo },
        }),
        recentBreaches: await AIMonitoring.countDocuments({
          type: 'breach',
          createdAt: { $gte: oneHourAgo },
        }),
        anomalies: await ActivityLog.countDocuments({
          isAnomaly: true,
          createdAt: { $gte: oneHourAgo },
        }),
        failedLogins: await ActivityLog.countDocuments({
          action: 'failed_login',
          createdAt: { $gte: oneHourAgo },
        }),
      },
    }

    // Determine overall health status
    if (health.metrics.criticalAlerts > 5 || health.metrics.recentBreaches > 3) {
      health.status = 'critical'
    } else if (health.metrics.criticalAlerts > 2 || health.metrics.recentBreaches > 1) {
      health.status = 'warning'
    }

    res.json({ health })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system health', error: error.message })
  }
}

export default {
  getAlerts,
  getAlertDetails,
  resolveAlert,
  getStatistics,
  getUserActivityLogs,
  moderateContentManual,
  getSystemHealth,
}
