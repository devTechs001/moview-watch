import AIMonitoring from '../models/AIMonitoring.js'
import ActivityLog from '../models/ActivityLog.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import Post from '../models/Post.js'
import Comment from '../models/Comment.js'

// AI Content Moderation
export const moderateContent = async (content, contentType, userId, contentId) => {
  try {
    const analysis = {
      isInappropriate: false,
      confidence: 0,
      flags: [],
      suggestions: [],
    }

    // Check for inappropriate keywords (simple implementation)
    const inappropriatePatterns = [
      { pattern: /\b(spam|scam|fake)\b/gi, category: 'spam', severity: 'medium' },
      { pattern: /\b(hate|racist|offensive)\b/gi, category: 'hate_speech', severity: 'high' },
      { pattern: /\b(kill|murder|violence)\b/gi, category: 'violence', severity: 'critical' },
      { pattern: /(https?:\/\/[^\s]+)/g, category: 'suspicious_link', severity: 'low' },
    ]

    let highestSeverity = 'low'
    const detectedPatterns = []

    for (const { pattern, category, severity } of inappropriatePatterns) {
      const matches = content.match(pattern)
      if (matches) {
        analysis.isInappropriate = true
        analysis.flags.push(category)
        detectedPatterns.push({
          pattern: pattern.toString(),
          confidence: 0.8,
          evidence: matches.join(', '),
        })

        if (severity === 'critical' || (severity === 'high' && highestSeverity !== 'critical')) {
          highestSeverity = severity
        }
      }
    }

    // Check for excessive caps (potential spam)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capsRatio > 0.7 && content.length > 20) {
      analysis.flags.push('excessive_caps')
      detectedPatterns.push({
        pattern: 'Excessive caps usage',
        confidence: 0.6,
        evidence: `${(capsRatio * 100).toFixed(1)}% uppercase`,
      })
    }

    // Check for repeated characters (spam pattern)
    if (/(.)\1{4,}/.test(content)) {
      analysis.flags.push('repeated_chars')
      detectedPatterns.push({
        pattern: 'Repeated characters',
        confidence: 0.7,
        evidence: 'Multiple repeated characters detected',
      })
    }

    if (analysis.isInappropriate) {
      // Create AI monitoring record
      await AIMonitoring.create({
        type: 'content',
        severity: highestSeverity,
        category: analysis.flags[0],
        user: userId,
        contentType,
        contentId,
        description: `Inappropriate content detected: ${analysis.flags.join(', ')}`,
        detectedPatterns,
        aiAnalysis: {
          model: 'content-moderator-v1',
          confidence: 0.8,
          reasoning: `Content flagged for: ${analysis.flags.join(', ')}`,
          suggestions: [
            'Review content manually',
            'Warn user about community guidelines',
            'Consider removing content if confirmed',
          ],
        },
        status: highestSeverity === 'critical' ? 'confirmed' : 'reviewing',
      })

      // Auto-fix for critical content
      if (highestSeverity === 'critical') {
        await autoFixContent(contentType, contentId, analysis.flags)
      }

      // Send notification to admins
      await notifyAdmins({
        type: 'content_flagged',
        title: 'Inappropriate Content Detected',
        message: `Content has been flagged for: ${analysis.flags.join(', ')}`,
        priority: highestSeverity,
        link: `/admin/content/${contentId}`,
      })
    }

    return analysis
  } catch (error) {
    console.error('Content moderation error:', error)
    return { isInappropriate: false, error: error.message }
  }
}

// Monitor user activity for anomalies
export const monitorUserActivity = async (userId, action, metadata = {}) => {
  try {
    // Log activity
    const activityLog = await ActivityLog.create({
      user: userId,
      action,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      device: metadata.device,
      location: metadata.location,
      sessionId: metadata.sessionId,
      metadata,
    })

    // Check for anomalies
    const anomalies = await detectAnomalies(userId, action, metadata)

    if (anomalies.detected) {
      activityLog.isAnomaly = true
      activityLog.anomalyScore = anomalies.score
      activityLog.aiFlags = anomalies.flags
      await activityLog.save()

      // Create monitoring alert
      await AIMonitoring.create({
        type: 'user_activity',
        severity: anomalies.severity,
        category: 'suspicious_activity',
        user: userId,
        description: anomalies.description,
        detectedPatterns: anomalies.patterns,
        aiAnalysis: {
          model: 'anomaly-detector-v1',
          confidence: anomalies.score,
          reasoning: anomalies.reasoning,
          suggestions: anomalies.suggestions,
        },
      })

      // Notify user if unusual activity
      if (anomalies.severity === 'high' || anomalies.severity === 'critical') {
        await notifyUser(userId, {
          type: 'unusual_activity',
          title: 'Unusual Activity Detected',
          message: 'We detected unusual activity on your account. If this wasn\'t you, please secure your account immediately.',
          priority: 'high',
          actionRequired: true,
          actions: [
            { label: 'Secure Account', action: 'link', url: '/settings/security', primary: true },
            { label: 'Not Me', action: 'link', url: '/security/report' },
          ],
        })
      }
    }

    return { logged: true, anomalies }
  } catch (error) {
    console.error('Activity monitoring error:', error)
    return { logged: false, error: error.message }
  }
}

// Detect anomalies in user behavior
async function detectAnomalies(userId, action, metadata) {
  const anomalies = {
    detected: false,
    score: 0,
    severity: 'low',
    flags: [],
    patterns: [],
    reasoning: '',
    suggestions: [],
  }

  try {
    const recentActivities = await ActivityLog.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    // Check for rapid actions (potential bot)
    if (recentActivities.length > 100) {
      anomalies.detected = true
      anomalies.score += 0.3
      anomalies.flags.push({ flag: 'rapid_actions', confidence: 0.8, reason: 'Too many actions in 24h' })
      anomalies.patterns.push({ pattern: 'Rapid action pattern', confidence: 0.8, evidence: `${recentActivities.length} actions in 24h` })
    }

    // Check for login from new location
    const previousLogins = await ActivityLog.find({
      user: userId,
      action: 'login',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).limit(10)

    if (metadata.location && previousLogins.length > 0) {
      const knownCountries = previousLogins.map(l => l.location?.country).filter(Boolean)
      if (metadata.location.country && !knownCountries.includes(metadata.location.country)) {
        anomalies.detected = true
        anomalies.score += 0.4
        anomalies.severity = 'medium'
        anomalies.flags.push({ flag: 'new_location', confidence: 0.9, reason: 'Login from new country' })
        anomalies.patterns.push({ pattern: 'New location login', confidence: 0.9, evidence: `Login from ${metadata.location.country}` })
      }
    }

    // Check for unusual action patterns
    const actionCounts = {}
    recentActivities.forEach(a => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1
    })

    if (actionCounts['failed_login'] && actionCounts['failed_login'] > 5) {
      anomalies.detected = true
      anomalies.score = 0.9
      anomalies.severity = 'critical'
      anomalies.flags.push({ flag: 'multiple_failed_logins', confidence: 1.0, reason: 'Potential brute force attack' })
      anomalies.patterns.push({ pattern: 'Multiple failed logins', confidence: 1.0, evidence: `${actionCounts['failed_login']} failed attempts` })
    }

    if (anomalies.detected) {
      anomalies.reasoning = `Detected ${anomalies.flags.length} suspicious pattern(s)`
      anomalies.suggestions = [
        'Monitor user activity closely',
        'Require additional verification',
        'Consider temporary account restriction',
      ]
    }

    return anomalies
  } catch (error) {
    console.error('Anomaly detection error:', error)
    return anomalies
  }
}

// Monitor login activities
export const monitorLogin = async (userId, success, metadata = {}) => {
  try {
    const action = success ? 'login' : 'failed_login'
    
    // Log login activity
    await ActivityLog.create({
      user: userId,
      action,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      device: metadata.device,
      location: metadata.location,
      sessionId: metadata.sessionId,
      metadata,
    })

    // Check for failed login attempts
    if (!success) {
      const failedAttempts = await ActivityLog.countDocuments({
        user: userId,
        action: 'failed_login',
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
      })

      if (failedAttempts >= 5) {
        // Potential brute force attack
        await AIMonitoring.create({
          type: 'login',
          severity: 'critical',
          category: 'brute_force',
          user: userId,
          ipAddress: metadata.ipAddress,
          description: `Multiple failed login attempts detected: ${failedAttempts} attempts`,
          detectedPatterns: [{
            pattern: 'Brute force attack',
            confidence: 0.95,
            evidence: `${failedAttempts} failed attempts in 15 minutes`,
          }],
          aiAnalysis: {
            model: 'login-monitor-v1',
            confidence: 0.95,
            reasoning: 'Unusual number of failed login attempts suggests automated attack',
            suggestions: [
              'Temporarily block IP address',
              'Require CAPTCHA verification',
              'Send security alert to user',
            ],
          },
          status: 'confirmed',
          actionTaken: 'warning_sent',
        })

        // Auto-fix: Block IP temporarily
        await autoFixBruteForce(metadata.ipAddress, userId)

        // Notify user
        await notifyUser(userId, {
          type: 'security_alert',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected on your account. If this wasn\'t you, please secure your account.',
          priority: 'urgent',
        })
      }
    }

    // Check for login from new device/location
    if (success) {
      const anomalies = await detectAnomalies(userId, 'login', metadata)
      if (anomalies.detected && anomalies.flags.some(f => f.flag === 'new_location')) {
        await notifyUser(userId, {
          type: 'login_from_new_device',
          title: 'New Login Detected',
          message: `We noticed a login from ${metadata.location?.country || 'a new location'}. Was this you?`,
          priority: 'medium',
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Login monitoring error:', error)
    return { success: false, error: error.message }
  }
}

// Auto-fix functions
async function autoFixContent(contentType, contentId, flags) {
  try {
    let fixed = false

    if (contentType === 'post') {
      const post = await Post.findById(contentId)
      if (post) {
        post.visibility = 'private'
        await post.save()
        fixed = true
      }
    } else if (contentType === 'comment') {
      const comment = await Comment.findById(contentId)
      if (comment) {
        await comment.deleteOne()
        fixed = true
      }
    }

    if (fixed) {
      await AIMonitoring.updateOne(
        { contentId, contentType },
        {
          autoFixed: true,
          fixDetails: {
            method: contentType === 'post' ? 'visibility_changed' : 'content_removed',
            appliedAt: new Date(),
            success: true,
          },
          actionTaken: 'content_removed',
        }
      )
    }

    return fixed
  } catch (error) {
    console.error('Auto-fix content error:', error)
    return false
  }
}

async function autoFixBruteForce(ipAddress, userId) {
  try {
    // In a real implementation, this would integrate with a firewall/rate limiter
    await AIMonitoring.create({
      type: 'breach',
      severity: 'critical',
      category: 'brute_force',
      user: userId,
      ipAddress,
      description: 'IP address temporarily blocked due to brute force attempt',
      autoFixed: true,
      fixDetails: {
        method: 'ip_blocked',
        appliedAt: new Date(),
        success: true,
      },
      actionTaken: 'ip_blocked',
    })

    return true
  } catch (error) {
    console.error('Auto-fix brute force error:', error)
    return false
  }
}

// Notification functions
async function notifyUser(userId, notificationData) {
  try {
    await Notification.create({
      user: userId,
      ...notificationData,
    })

    // Emit Socket.io event
    // This would be implemented with proper Socket.io integration
    return true
  } catch (error) {
    console.error('Notify user error:', error)
    return false
  }
}

async function notifyAdmins(notificationData) {
  try {
    const admins = await User.find({ role: 'admin' })
    
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        category: 'security',
        ...notificationData,
      })
    }

    return true
  } catch (error) {
    console.error('Notify admins error:', error)
    return false
  }
}

// Breach detection
export const detectBreach = async (type, metadata = {}) => {
  try {
    const breach = {
      detected: false,
      type,
      severity: 'low',
      details: [],
    }

    // SQL Injection detection
    if (type === 'sql_injection') {
      const sqlPatterns = [
        /(\bUNION\b.*\bSELECT\b)/gi,
        /(\bOR\b.*=.*)/gi,
        /(\bDROP\b.*\bTABLE\b)/gi,
        /('.*--)/g,
      ]

      const query = metadata.query || ''
      for (const pattern of sqlPatterns) {
        if (pattern.test(query)) {
          breach.detected = true
          breach.severity = 'critical'
          breach.details.push(`SQL injection pattern detected: ${pattern}`)
        }
      }
    }

    // XSS detection
    if (type === 'xss_attempt') {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
      ]

      const content = metadata.content || ''
      for (const pattern of xssPatterns) {
        if (pattern.test(content)) {
          breach.detected = true
          breach.severity = 'high'
          breach.details.push(`XSS pattern detected: ${pattern}`)
        }
      }
    }

    if (breach.detected) {
      await AIMonitoring.create({
        type: 'breach',
        severity: breach.severity,
        category: type,
        user: metadata.userId,
        ipAddress: metadata.ipAddress,
        description: `Security breach detected: ${breach.details.join(', ')}`,
        detectedPatterns: breach.details.map(d => ({
          pattern: d,
          confidence: 0.95,
          evidence: metadata.query || metadata.content,
        })),
        aiAnalysis: {
          model: 'breach-detector-v1',
          confidence: 0.95,
          reasoning: 'Security breach attempt detected',
          suggestions: [
            'Block IP address immediately',
            'Review system logs',
            'Update security protocols',
          ],
        },
        status: 'confirmed',
        actionTaken: 'ip_blocked',
      })

      await notifyAdmins({
        type: 'breach_detected',
        title: 'Security Breach Detected',
        message: `${type} attempt detected from IP ${metadata.ipAddress}`,
        priority: 'urgent',
      })
    }

    return breach
  } catch (error) {
    console.error('Breach detection error:', error)
    return { detected: false, error: error.message }
  }
}

export default {
  moderateContent,
  monitorUserActivity,
  monitorLogin,
  detectBreach,
}
