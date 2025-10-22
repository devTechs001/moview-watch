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

// Import routes
import authRoutes from './routes/authRoutes.js'
import movieRoutes from './routes/movieRoutes.js'
import userRoutes from './routes/userRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import socialRoutes from './routes/socialRoutes.js'
import aiSecurityRoutes from './routes/aiSecurityRoutes.js'
import tmdbRoutes from './routes/tmdbRoutes.js'

// Load env vars
dotenv.config()

// Connect to database
connectDB()

// Initialize express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

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

// Error handler
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join a chat room
  socket.on('join-chat', (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined their chat room`)
  })

  // Handle chat messages
  socket.on('send-message', (data) => {
    io.to(data.recipientId).emit('receive-message', data)
  })

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.recipientId).emit('user-typing', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
