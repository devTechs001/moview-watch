import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import { activityLogger, breachDetector } from './middleware/activityMonitor.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import movieRoutes from './routes/movieRoutes.js'
import userRoutes from './routes/userRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import socialRoutes from './routes/socialRoutes.js'
import aiSecurityRoutes from './routes/aiSecurityRoutes.js'
import tmdbRoutes from './routes/tmdbRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import chatroomRoutes from './routes/chatroomRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import postRoutes from './routes/postRoutes.js'
import aiMonitoringRoutes from './routes/aiMonitoringRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import inviteLinkRoutes from './routes/inviteLinkRoutes.js'

// Load env vars
dotenv.config()

// Debug: Log environment loading
console.log('🔧 Environment loaded from .env file')
console.log('📍 NODE_ENV:', process.env.NODE_ENV)
console.log('🔌 PORT:', process.env.PORT)
console.log('🗄️  MongoDB URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing')
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing')

// Connect to database
connectDB()

// Initialize express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// AI Monitoring Middleware (Optional - can be disabled via env)
if (process.env.AI_MONITORING_ENABLED !== 'false') {
  console.log('🤖 AI Monitoring: ENABLED')
  app.use(activityLogger)
  app.use(breachDetector)
} else {
  console.log('🤖 AI Monitoring: DISABLED')
}

// Make io accessible to routes
app.set('io', io)

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CinemaFlix API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/user', userRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/admin/security', aiSecurityRoutes)
app.use('/api/admin/tmdb', tmdbRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/chatrooms', chatroomRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/ai-monitoring', aiMonitoringRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/invite', inviteLinkRoutes)

// Error handler
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  // Join user's personal room
  socket.on('join-chat', (userId) => {
    socket.join(userId)
    socket.userId = userId
    console.log(`📱 User ${userId} joined chat room`)
    
    // Notify admins of online user
    io.to('admin-room').emit('user_online', { userId, socketId: socket.id })
  })

  // Admin joins admin room
  socket.on('join-admin', (adminId) => {
    socket.join('admin-room')
    socket.isAdmin = true
    console.log(`👑 Admin ${adminId} joined admin room`)
  })

  // Real-time chat messages
  socket.on('send-message', (data) => {
    io.to(data.recipientId).emit('receive-message', {
      ...data,
      timestamp: new Date(),
    })
    
    // Notify admin of message
    io.to('admin-room').emit('new_message', data)
  })

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.recipientId).emit('user-typing', data)
  })

  // Video call - WebRTC signaling
  socket.on('initiate-call', (data) => {
    io.to(data.recipientId).emit('incoming-call', {
      callerId: data.callerId,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar,
      type: data.type, // 'video' or 'audio'
    })
  })

  socket.on('accept-call', (data) => {
    io.to(data.callerId).emit('call-accepted', data)
  })

  socket.on('reject-call', (data) => {
    io.to(data.callerId).emit('call-rejected', data)
  })

  socket.on('end-call', (data) => {
    io.to(data.recipientId).emit('call-ended', data)
  })

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    io.to(data.recipientId).emit('webrtc-offer', data)
  })

  socket.on('webrtc-answer', (data) => {
    io.to(data.recipientId).emit('webrtc-answer', data)
  })

  socket.on('ice-candidate', (data) => {
    io.to(data.recipientId).emit('ice-candidate', data)
  })

  // Real-time posts
  socket.on('new-post', (data) => {
    // Broadcast to all users
    io.emit('new_post', data)
    
    // Notify admins for approval
    io.to('admin-room').emit('content_needs_approval', {
      type: 'post',
      content: data,
      userId: socket.userId,
    })
  })

  // Real-time likes
  socket.on('like-post', (data) => {
    io.emit('post_liked', data)
  })

  // Real-time comments
  socket.on('new-comment', (data) => {
    io.emit('post_commented', data)
  })

  // Real-time stories
  socket.on('new-story', (data) => {
    io.emit('new_story', data)
  })

  // Content approval (admin only)
  socket.on('approve_content', (data) => {
    if (socket.isAdmin) {
      io.emit('content_approved', data)
      io.to(data.userId).emit('notification', {
        type: 'success',
        message: 'Your content has been approved!',
      })
    }
  })

  socket.on('reject_content', (data) => {
    if (socket.isAdmin) {
      io.to(data.userId).emit('notification', {
        type: 'error',
        message: `Content rejected: ${data.reason}`,
      })
    }
  })

  // New user registration notification
  socket.on('user-registered', (userData) => {
    io.to('admin-room').emit('new_user_registered', userData)
  })

  // Admin sends message to user
  socket.on('admin-message', (data) => {
    io.to(data.userId).emit('admin_message', {
      message: data.message,
      adminName: data.adminName,
      timestamp: new Date(),
    })
  })

  // Chatroom events
  socket.on('join-chatroom', (chatroomId) => {
    socket.join(`chatroom-${chatroomId}`)
    console.log(`👥 User joined chatroom: ${chatroomId}`)
    io.to(`chatroom-${chatroomId}`).emit('user_joined_chatroom', {
      userId: socket.userId,
      chatroomId,
    })
  })

  socket.on('leave-chatroom', (chatroomId) => {
    socket.leave(`chatroom-${chatroomId}`)
    io.to(`chatroom-${chatroomId}`).emit('user_left_chatroom', {
      userId: socket.userId,
      chatroomId,
    })
  })

  socket.on('chatroom-message', (data) => {
    io.to(`chatroom-${data.chatroomId}`).emit('new_chatroom_message', data)
  })

  // Video call signaling
  socket.on('start-video-call', (data) => {
    io.to(data.targetUserId).emit('incoming_video_call', {
      callerId: socket.userId,
      callerName: data.callerName,
      roomId: data.roomId,
      callType: data.callType, // 'video' or 'audio'
    })
  })

  socket.on('accept-video-call', (data) => {
    io.to(data.callerId).emit('video_call_accepted', {
      userId: socket.userId,
      roomId: data.roomId,
    })
  })

  socket.on('reject-video-call', (data) => {
    io.to(data.callerId).emit('video_call_rejected', {
      userId: socket.userId,
    })
  })

  socket.on('end-video-call', (data) => {
    io.to(data.roomId).emit('video_call_ended', {
      userId: socket.userId,
    })
  })

  // WebRTC signaling for video calls
  socket.on('video-offer', (data) => {
    io.to(data.targetUserId).emit('video-offer', {
      offer: data.offer,
      from: socket.userId,
    })
  })

  socket.on('video-answer', (data) => {
    io.to(data.targetUserId).emit('video-answer', {
      answer: data.answer,
      from: socket.userId,
    })
  })

  socket.on('video-ice-candidate', (data) => {
    io.to(data.targetUserId).emit('video-ice-candidate', {
      candidate: data.candidate,
      from: socket.userId,
    })
  })

  // Real-time interactions
  socket.on('share-content', (data) => {
    io.emit('content_shared', {
      contentType: data.contentType,
      contentId: data.contentId,
      sharedBy: socket.userId,
      timestamp: new Date(),
    })
  })

  socket.on('like-content', (data) => {
    io.emit('content_liked', {
      contentType: data.contentType,
      contentId: data.contentId,
      likedBy: socket.userId,
      timestamp: new Date(),
    })
  })

  socket.on('comment-content', (data) => {
    io.emit('content_commented', {
      contentType: data.contentType,
      contentId: data.contentId,
      comment: data.comment,
      commentedBy: socket.userId,
      timestamp: new Date(),
    })
  })

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
    
    if (socket.userId) {
      io.to('admin-room').emit('user_offline', { 
        userId: socket.userId, 
        socketId: socket.id 
      })
    }
  })
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
