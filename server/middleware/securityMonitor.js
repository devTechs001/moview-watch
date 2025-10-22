import SecurityEvent from '../models/SecurityEvent.js'
import rateLimit from 'express-rate-limit'

// Monitor failed login attempts
export const monitorLoginAttempts = async (req, res, next) => {
  const { email } = req.body
  const ipAddress = req.ip

  // Check recent failed attempts
  const recentAttempts = await SecurityEvent.countDocuments({
    eventType: 'failed_login',
    ipAddress,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
  })

  if (recentAttempts >= 5) {
    // Log suspicious activity
    await SecurityEvent.create({
      eventType: 'suspicious_activity',
      severity: 'high',
      ipAddress,
      userAgent: req.get('user-agent'),
      description: 'Multiple failed login attempts detected',
      aiAnalysis: {
        riskScore: 75,
        confidence: 90,
        patterns: ['brute_force_attempt'],
        recommendations: ['Block IP temporarily', 'Require CAPTCHA'],
      },
    })

    return res.status(429).json({
      message: 'Too many failed login attempts. Please try again later.',
    })
  }

  next()
}

// Log failed login
export const logFailedLogin = async (email, ipAddress, userAgent) => {
  await SecurityEvent.create({
    eventType: 'failed_login',
    severity: 'medium',
    ipAddress,
    userAgent,
    description: `Failed login attempt for ${email}`,
    aiAnalysis: {
      riskScore: 30,
      confidence: 85,
      patterns: ['failed_authentication'],
      recommendations: ['Monitor IP address', 'Alert user if this continues'],
    },
  })
}

// Rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: async (req, res) => {
    await SecurityEvent.create({
      eventType: 'rate_limit_exceeded',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      endpoint: req.path,
      description: 'API rate limit exceeded',
      aiAnalysis: {
        riskScore: 50,
        confidence: 95,
        patterns: ['excessive_requests'],
        recommendations: ['Apply stricter rate limits', 'Monitor for DDoS patterns'],
      },
    })

    res.status(429).json({ message: 'Too many requests, please try again later.' })
  },
})

// Detect suspicious patterns
export const detectAnomalies = async (req, res, next) => {
  const userAgent = req.get('user-agent')
  
  // Check for suspicious user agents
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
    await SecurityEvent.create({
      eventType: 'suspicious_activity',
      severity: 'low',
      ipAddress: req.ip,
      userAgent,
      endpoint: req.path,
      description: 'Suspicious user agent detected',
      aiAnalysis: {
        riskScore: 40,
        confidence: 70,
        patterns: ['bot_activity'],
        recommendations: ['Monitor activity', 'Consider blocking if persistent'],
      },
    })
  }

  next()
}

export default {
  monitorLoginAttempts,
  logFailedLogin,
  apiLimiter,
  detectAnomalies,
}
