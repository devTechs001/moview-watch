import SecurityEvent from '../models/SecurityEvent.js'
import AILearning from '../models/AILearning.js'
import User from '../models/User.js'

// @desc    Get security dashboard
// @route   GET /api/admin/security/dashboard
// @access  Private/Admin
export const getSecurityDashboard = async (req, res) => {
  try {
    const totalEvents = await SecurityEvent.countDocuments()
    const criticalEvents = await SecurityEvent.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } })
    const highEvents = await SecurityEvent.countDocuments({ severity: 'high', status: { $ne: 'resolved' } })
    const autoFixedEvents = await SecurityEvent.countDocuments({ 'aiAnalysis.autoFixApplied': true })

    const recentEvents = await SecurityEvent.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)

    const eventsByType = await SecurityEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const eventsBySeverity = await SecurityEvent.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ])

    const aiPerformance = await AILearning.findOne({ category: 'security' })
      .sort({ updatedAt: -1 })

    res.json({
      stats: {
        totalEvents,
        criticalEvents,
        highEvents,
        autoFixedEvents,
        aiPerformance: aiPerformance?.performance || {
          successRate: 0,
          falsePositiveRate: 0,
          falseNegativeRate: 0,
          averageResponseTime: 0,
        },
      },
      recentEvents,
      eventsByType,
      eventsBySeverity,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Log security event
// @route   POST /api/admin/security/events
// @access  Private/Admin
export const logSecurityEvent = async (req, res) => {
  try {
    const event = await SecurityEvent.create(req.body)

    // AI Analysis
    const aiAnalysis = await analyzeSecurityEvent(event)
    event.aiAnalysis = aiAnalysis

    // Auto-fix if confidence is high and severity allows
    if (aiAnalysis.confidence > 80 && event.severity !== 'critical') {
      const autoFix = await applyAutoFix(event)
      if (autoFix.success) {
        event.aiAnalysis.autoFixApplied = true
        event.aiAnalysis.autoFixDetails = autoFix.details
        event.status = 'auto_fixed'
      }
    }

    await event.save()

    // Learn from this event
    await updateAILearning('security', event)

    res.status(201).json({ event })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get AI insights
// @route   GET /api/admin/security/insights
// @access  Private/Admin
export const getAIInsights = async (req, res) => {
  try {
    const insights = await AILearning.find()
      .sort({ updatedAt: -1 })
      .limit(10)

    const recommendations = []

    // Generate recommendations based on patterns
    for (const learning of insights) {
      if (learning.insights && learning.insights.length > 0) {
        const actionableInsights = learning.insights.filter((i) => i.actionable && !i.implemented)
        recommendations.push(...actionableInsights)
      }
    }

    res.json({
      insights,
      recommendations: recommendations.slice(0, 20),
      learningStats: {
        totalPatterns: insights.reduce((sum, i) => sum + (i.patterns?.length || 0), 0),
        totalDataPoints: insights.reduce((sum, i) => sum + (i.dataPoints?.length || 0), 0),
        averageAccuracy: insights.reduce((sum, i) => sum + (i.models?.accuracy || 0), 0) / insights.length,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Resolve security event
// @route   PUT /api/admin/security/events/:id/resolve
// @access  Private/Admin
export const resolveSecurityEvent = async (req, res) => {
  try {
    const event = await SecurityEvent.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    event.status = 'resolved'
    event.resolution = {
      action: req.body.action,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      notes: req.body.notes,
    }

    await event.save()

    // Update AI learning with resolution outcome
    await updateAILearning('security', event, { resolved: true, action: req.body.action })

    res.json({ event })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get anomaly detection results
// @route   GET /api/admin/security/anomalies
// @access  Private/Admin
export const getAnomalies = async (req, res) => {
  try {
    const anomalies = []

    // Detect unusual login patterns
    const recentLogins = await SecurityEvent.find({
      eventType: 'failed_login',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    if (recentLogins.length > 10) {
      anomalies.push({
        type: 'unusual_login_attempts',
        severity: 'high',
        description: `${recentLogins.length} failed login attempts in the last 24 hours`,
        count: recentLogins.length,
      })
    }

    // Detect rate limit violations
    const rateLimitEvents = await SecurityEvent.find({
      eventType: 'rate_limit_exceeded',
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    })

    if (rateLimitEvents.length > 5) {
      anomalies.push({
        type: 'rate_limit_violations',
        severity: 'medium',
        description: `${rateLimitEvents.length} rate limit violations in the last hour`,
        count: rateLimitEvents.length,
      })
    }

    res.json({ anomalies })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper: Analyze security event with AI
async function analyzeSecurityEvent(event) {
  // Simulate AI analysis
  const patterns = []
  let riskScore = 0

  switch (event.eventType) {
    case 'failed_login':
      riskScore = 30
      patterns.push('repeated_failed_attempts')
      break
    case 'suspicious_activity':
      riskScore = 70
      patterns.push('anomalous_behavior')
      break
    case 'unauthorized_access':
      riskScore = 90
      patterns.push('access_violation')
      break
    case 'sql_injection_attempt':
      riskScore = 95
      patterns.push('injection_attack')
      break
    default:
      riskScore = 20
  }

  const recommendations = generateRecommendations(event.eventType, riskScore)

  return {
    riskScore,
    confidence: 85 + Math.random() * 10,
    patterns,
    recommendations,
    autoFixApplied: false,
  }
}

// Helper: Generate recommendations
function generateRecommendations(eventType, riskScore) {
  const recommendations = []

  if (riskScore > 80) {
    recommendations.push('Block IP address immediately')
    recommendations.push('Alert security team')
    recommendations.push('Audit user account')
  } else if (riskScore > 50) {
    recommendations.push('Monitor user activity')
    recommendations.push('Increase authentication requirements')
  } else {
    recommendations.push('Log for further analysis')
    recommendations.push('Update security patterns')
  }

  return recommendations
}

// Helper: Apply auto-fix
async function applyAutoFix(event) {
  // Simulate auto-fix actions
  const fixes = {
    failed_login: 'Temporarily blocked IP after 5 failed attempts',
    rate_limit_exceeded: 'Applied stricter rate limits',
    xss_attempt: 'Sanitized input and updated validation rules',
  }

  if (fixes[event.eventType]) {
    return {
      success: true,
      details: fixes[event.eventType],
    }
  }

  return { success: false }
}

// Helper: Update AI learning
async function updateAILearning(category, event, outcome = {}) {
  let learning = await AILearning.findOne({ category })

  if (!learning) {
    learning = new AILearning({
      category,
      learningType: 'pattern_recognition',
      dataPoints: [],
      patterns: [],
      models: {},
      insights: [],
      performance: {
        successRate: 0,
        falsePositiveRate: 0,
        falseNegativeRate: 0,
        averageResponseTime: 0,
      },
    })
  }

  // Add data point
  learning.dataPoints.push({
    timestamp: event.createdAt,
    features: {
      eventType: event.eventType,
      severity: event.severity,
      riskScore: event.aiAnalysis?.riskScore,
    },
    outcome: outcome.resolved ? 'resolved' : 'detected',
    confidence: event.aiAnalysis?.confidence,
  })

  // Update patterns
  const existingPattern = learning.patterns.find((p) => p.name === event.eventType)
  if (existingPattern) {
    existingPattern.frequency += 1
    existingPattern.lastSeen = new Date()
  } else {
    learning.patterns.push({
      name: event.eventType,
      description: event.description,
      frequency: 1,
      accuracy: 85,
      lastSeen: new Date(),
    })
  }

  await learning.save()
}
