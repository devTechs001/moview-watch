// AI monitoring service temporarily disabled
// import { monitorUserActivity, detectBreach } from '../services/aiMonitoringService.js'
import ActivityLog from '../models/ActivityLog.js'

// Middleware to log all user activities
export const activityLogger = async (req, res, next) => {
  // Skip for certain routes
  const skipRoutes = ['/api/auth/check', '/health', '/socket.io']
  if (skipRoutes.some(route => req.path.includes(route))) {
    return next()
  }

  // Skip if no user (public routes)
  if (!req.user) {
    return next()
  }

  const metadata = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    sessionId: req.session?.id,
    path: req.path,
    method: req.method,
    query: req.query,
    body: sanitizeBody(req.body),
  }

  // Log activity after response
  res.on('finish', async () => {
    try {
      if (req.user) {
        const action = determineAction(req.method, req.path)
        if (action) {
          // Direct logging instead of service
          await ActivityLog.create({
            user: req.user._id,
            action,
            ...metadata,
          })
        }
      }
    } catch (error) {
      console.error('Activity logging error:', error)
    }
  })

  next()
}

// Middleware to detect security breaches
export const breachDetector = async (req, res, next) => {
  // Skip for socket.io and health checks
  const skipRoutes = ['/socket.io', '/health', '/api/auth/check']
  if (skipRoutes.some(route => req.path.includes(route))) {
    return next()
  }

  try {
    const metadata = {
      userId: req.user?._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      path: req.path,
      method: req.method,
    }

    // Check for SQL injection in query params
    if (req.query && Object.keys(req.query).length > 0) {
      const queryString = JSON.stringify(req.query)
      metadata.query = queryString
      // Simple SQL injection detection
      const sqlPatterns = /('|(--)|;|(\|\|)|(union|select|insert|update|delete|drop))/gi
      const hasSQLInjection = sqlPatterns.test(queryString)
      
      if (hasSQLInjection) {
        return res.status(403).json({
          message: 'Suspicious activity detected',
          code: 'BREACH_DETECTED',
        })
      }
    }

    // Check for XSS in request body
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      const bodyContent = JSON.stringify(req.body)
      const xssPatterns = /<script|javascript:|onerror=|onload=/gi
      const hasXSS = xssPatterns.test(bodyContent)
      
      if (hasXSS) {
        return res.status(403).json({
          message: 'Suspicious content detected',
          code: 'XSS_DETECTED',
        })
      }
    }

    next()
  } catch (error) {
    console.error('Breach detection error:', error)
    // Don't block request on error, just log it
    next()
  }
}

// Helper functions
function determineAction(method, path) {
  const actionMap = {
    'POST /api/posts': 'create_post',
    'PUT /api/posts': 'edit_post',
    'DELETE /api/posts': 'delete_post',
    'POST /api/posts/.*/like': 'like_post',
    'POST /api/posts/.*/comments': 'create_comment',
    'POST /api/movies/.*/watch': 'watch_movie',
    'POST /api/movies/.*/rate': 'rate_movie',
    'POST /api/user/wishlist': 'add_to_wishlist',
    'POST /api/social/follow': 'follow_user',
    'POST /api/chatrooms/.*/join': 'join_chatroom',
    'POST /api/auth/login': 'login',
    'POST /api/auth/logout': 'logout',
    'POST /api/auth/register': 'register',
    'PUT /api/user/profile': 'update_profile',
    'POST /api/subscriptions/subscribe': 'subscribe',
  }

  const key = `${method} ${path}`
  
  for (const [pattern, action] of Object.entries(actionMap)) {
    const regex = new RegExp(`^${pattern.replace(/\.\*/g, '.*')}$`)
    if (regex.test(key)) {
      return action
    }
  }

  return null
}

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body

  const sanitized = {}
  for (const [key, value] of Object.entries(body)) {
    // Don't log sensitive fields
    if (['password', 'token', 'secret', 'creditCard'].includes(key)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeBody(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export default {
  activityLogger,
  breachDetector,
}
