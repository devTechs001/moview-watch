import mongoose from 'mongoose'

const connectDB = async () => {
  // MongoDB URIs
  const ATLAS_URI = process.env.MONGODB_URI // Atlas (Cloud)
  const LOCAL_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinemaflix' // Local Compass

  // Connection options
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
  }

  // Try Atlas first, fallback to local
  const tryConnect = async (uri, name) => {
    try {
      console.log(`🔄 Attempting to connect to ${name}...`)
      const conn = await mongoose.connect(uri, options)
      console.log(`✅ MongoDB Connected to ${name}: ${conn.connection.host}`)
      console.log(`📊 Database: ${conn.connection.name}`)
      return true
    } catch (error) {
      console.error(`❌ ${name} Connection Failed: ${error.message}`)
      return false
    }
  }

  try {
    // First, try Atlas (if configured)
    if (ATLAS_URI && ATLAS_URI !== 'mongodb://localhost:27017/cinemaflix') {
      console.log('🌐 Trying MongoDB Atlas (Cloud)...')
      const atlasConnected = await tryConnect(ATLAS_URI, 'MongoDB Atlas')
      
      if (atlasConnected) {
        return // Successfully connected to Atlas
      }
      
      // Atlas failed, try local
      console.log('⚠️  Atlas unreachable, falling back to local MongoDB...')
    }

    // Try local MongoDB Compass
    console.log('💻 Trying Local MongoDB (Compass)...')
    const localConnected = await tryConnect(LOCAL_URI, 'Local MongoDB')
    
    if (!localConnected) {
      console.error('\n❌ Failed to connect to both Atlas and Local MongoDB!')
      console.error('\n📋 Troubleshooting:')
      console.error('   1. Check if MongoDB is running locally (MongoDB Compass)')
      console.error('   2. Verify MONGODB_URI in .env file')
      console.error('   3. Check network connection for Atlas')
      console.error('   4. Ensure MongoDB service is started\n')
      process.exit(1)
    }
  } catch (error) {
    console.error(`❌ Unexpected Error: ${error.message}`)
    process.exit(1)
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error(`🔴 Mongoose connection error: ${err.message}`)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('\n👋 MongoDB connection closed due to app termination')
  process.exit(0)
})

export default connectDB
