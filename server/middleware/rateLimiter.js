import rateLimit from 'express-rate-limit'

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
})

// Post creation limiter
export const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 posts per minute
  message: 'Too many posts created, please slow down.',
})

// Comment limiter
export const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 comments per minute
  message: 'Too many comments, please slow down.',
})

// Search limiter
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 searches per minute
  message: 'Too many search requests.',
})

export default {
  apiLimiter,
  authLimiter,
  postLimiter,
  commentLimiter,
  searchLimiter,
}
