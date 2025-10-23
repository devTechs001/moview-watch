import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Debug: Check if MONGODB_URI is loaded
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env file!')
      console.error('Please check that .env file exists in the server directory')
      process.exit(1)
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
