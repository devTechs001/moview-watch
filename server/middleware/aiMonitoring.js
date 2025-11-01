import AISettings from '../models/AISettings.js'
import AILearningData from '../models/AILearningData.js'
import AIMonitoring from '../models/AIMonitoring.js'

// Threat detection class
class ThreatDetector {
  constructor() {
    this.threatPatterns = {
      xss: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
      ],
      sqlInjection: [
        /('|(\-\-)|(;)|(\|\|)|(\*))/gi,
        /(union|select|insert|update|delete|drop|create|alter)/gi,
      ],
      suspicious: [
        /eval\(/gi,
        /exec\(/gi,
        /<iframe/gi,
      ],
    }
  }

  detectXSS(input) {
    if (typeof input !== 'string') return false
    return this.threatPatterns.xss.some(pattern => pattern.test(input))
  }

  detectSQLInjection(input) {
    if (typeof input !== 'string') return false
    return this.threatPatterns.sqlInjection.some(pattern => pattern.test(input))
  }

  detectSuspicious(input) {
    if (typeof input !== 'string') return false
    return this.threatPatterns.suspicious.some(pattern => pattern.test(input))
  }

  analyzeThreat(data) {
    const threats = []
    const { input } = data

    if (input) {
      const inputStr = typeof input === 'string' ? input : JSON.stringify(input)

      if (this.detectXSS(inputStr)) {
        threats.push({
          type: 'xss',
          severity: 'high',
          description: 'Cross-site scripting attempt detected',
        })
      }

      if (this.detectSQLInjection(inputStr)) {
        threats.push({
          type: 'sql_injection',
          severity: 'critical',
          description: 'SQL injection attempt detected',
        })
      }

      if (this.detectSuspicious(inputStr)) {
        threats.push({
          type: 'suspicious_pattern',
          severity: 'medium',
          description: 'Suspicious code pattern detected',
        })
      }
    }

    return threats
  }
}

const threatDetector = new ThreatDetector()

// AI Monitoring Middleware
export const aiMonitorMiddleware = async (req, res, next) => {
  try {
    // Check if AI monitoring is enabled
    const aiSettings = await AISettings.findOne({ feature: 'learning' })
    if (!aiSettings || !aiSettings.enabled) {
      return next()
    }

    // Analyze request for threats
    const threats = threatDetector.analyzeThreat({
      userId: req.user?._id,
      ipAddress: req.ip,
      action: req.method + ' ' + req.path,
      input: req.body,
    })

    if (threats.length > 0) {
      const criticalThreats = threats.filter(t => t.severity === 'critical')
      
      // Log threat
      await AIMonitoring.create({
        type: 'security',
        severity: criticalThreats.length > 0 ? 'critical' : threats[0].severity,
        category: threats[0].type,
        user: req.user?._id,
        description: threats.map(t => t.description).join(', '),
        detectedPatterns: threats,
        aiAnalysis: {
          model: 'threat-detector-v1',
          confidence: 0.9,
          reasoning: 'Malicious pattern detected in request',
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
          method: req.method,
        },
      })

      // Block critical threats
      if (criticalThreats.length > 0) {
        // Emit Socket.IO event
        const io = req.app.get('io')
        if (io) {
          io.to('admin-room').emit('threat_detected', {
            type: criticalThreats[0].type,
            severity: 'critical',
            user: req.user?._id,
            timestamp: new Date(),
          })
        }

        return res.status(403).json({
          message: 'Request blocked due to security concerns',
          code: 'SECURITY_THREAT_DETECTED',
        })
      }
    }

    // Log learning data
    if (req.user) {
      await AILearningData.create({
        category: 'user_behavior',
        data: {
          action: req.method + ' ' + req.path,
          timestamp: new Date(),
        },
        context: {
          userId: req.user._id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.path,
          action: req.method,
        },
        processed: false,
      })
    }

    next()
  } catch (error) {
    console.error('AI Monitoring middleware error:', error)
    next() // Don't block on error
  }
}

export default aiMonitorMiddleware
