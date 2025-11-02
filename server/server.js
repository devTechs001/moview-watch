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
import aiMonitorMiddleware from './middleware/aiMonitoring.js'
import { handleBrokenImages } from './middleware/imageHandler.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import movieRoutes from './routes/movieRoutes.js'
import movieImportRoutes from './routes/movieImportRoutes.js'
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
import chatRoutes from './routes/chatRoutes.js'
import inviteLinkRoutes from './routes/inviteLinkRoutes.js'
import friendRoutes from './routes/friendRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import aiAssistantRoutes from './routes/aiAssistantRoutes.js'
import downloadRoutes from './routes/downloadRoutes.js'
import aiRecommendationRoutes from './routes/aiRecommendationRoutes.js'
import adminRealtimeRoutes from './routes/adminRealtimeRoutes.js'
import chatroomManagementRoutes from './routes/chatroomManagementRoutes.js'
import contentLibraryRoutes from './routes/contentLibraryRoutes.js'
import musicRoutes from './routes/musicRoutes.js'
import shortsRoutes from './routes/shortsRoutes.js'

// Load env vars
dotenv.config()

// Debug: Log environment loading
console.log(' Environment loaded from .env file')
console.log(' NODE_ENV:', process.env.NODE_ENV)
console.log(' PORT:', process.env.PORT)
console.log('  MongoDB URI:', process.env.MONGODB_URI ||process.env.MONGO_URI ? ' Loaded' : ' Missing')
console.log(' JWT Secret:', process.env.JWT_SECRET ? ' Loaded' : ' Missing')
console.log('🔧 Environment loaded from .env file')
console.log('📍 NODE_ENV:', process.env.NODE_ENV)
console.log('🔌 PORT:', process.env.PORT)
console.log('🗄️  MongoDB URI:', process.env.MONGODB_URI ||process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing')
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing')

import seedMovies from './utils/seedMovies.js'

// Connect to database
connectDB()

// Seed movies in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    try {
      await seedMovies()
    } catch (error) {
      console.error('Error seeding movies:', error)
    }
  }, 2000) // Wait 2 seconds for DB connection
}

// Initialize express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, tools)
      if (!origin) return callback(null, true);
      
      // Allow all localhost origins
      if (origin.includes('localhost')) return callback(null, true);
      
      // Allow specific domains
      const allowedDomains = [
        'https://cinemaflxc.netlify.app',
        'https://cinemaflx-server.onrender.com',
        process.env.CLIENT_URL
      ].filter(Boolean);
      
      if (allowedDomains.some(domain => origin.includes(domain))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  },
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}))
// Enhanced CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, tools)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow specific domains
    const allowedDomains = [
      'https://cinemaflxc.netlify.app',
      'https://cinemaflx-server.onrender.com',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (allowedDomains.some(domain => origin.includes(domain))) {
      callback(null, true);
    } else {
      console.log('🚫 Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
}))

// Pre-flight OPTIONS handler
app.options('*', cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// AI Monitoring Middleware (Optional - can be disabled via env)
if (process.env.AI_MONITORING_ENABLED !== 'false') {
  console.log('🤖 AI Monitoring: ENABLED')
  // Activity monitoring
  app.use(activityLogger)
  app.use(breachDetector)

  // AI monitoring (self-learning threat detection)
  app.use(aiMonitorMiddleware)
} else {
  console.log('🤖 AI Monitoring: DISABLED')
}

// Make io accessible to routes
app.set('io', io)

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join movie room for real-time updates
  socket.on('joinMovie', (movieId) => {
    socket.join(`movie:${movieId}`);
    console.log(`Socket ${socket.id} joined movie room: ${movieId}`);
  });

  // Join short room for real-time updates
  socket.on('joinShort', (shortId) => {
    socket.join(`short:${shortId}`);
    console.log(`Socket ${socket.id} joined short room: ${shortId}`);
  });

  // Handle real-time comments
  socket.on('comment', async (data) => {
    try {
      const { movieId, comment, userId } = data;
      // Broadcast to all clients in the movie room
      io.to(`movie:${movieId}`).emit('newComment', {
        movieId,
        comment,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Comment error:', error);
      socket.emit('error', { message: 'Failed to process comment' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Apply image handler middleware to all routes that might contain images
app.use(['/api/movies', '/api/library/shorts', '/api/users'], handleBrokenImages);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CinemaFlix API is running' })
})

// Rate limiting disabled - can be enabled later
// app.use('/api/', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/library/music', musicRoutes)
app.use('/api/library/shorts', shortsRoutes)
app.use('/api/movies/import', movieImportRoutes)
app.use('/api/user', userRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/admin/security', aiSecurityRoutes)
app.use('/api/admin/tmdb', tmdbRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/chatrooms', chatroomRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/ai-monitoring', aiMonitoringRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/invite', inviteLinkRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/ai-assistant', aiAssistantRoutes)
app.use('/api', downloadRoutes)
app.use('/api/ai', aiRecommendationRoutes)
app.use('/api/admin/realtime', adminRealtimeRoutes)
app.use('/api/chatrooms/manage', chatroomManagementRoutes)
app.use('/api/library', contentLibraryRoutes)

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
