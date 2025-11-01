import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '../.env') })

const createAdmin = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...')
    
    // Try cloud first, fallback to local
    let mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI
    let connected = false
    
    if (mongoURI && !mongoURI.includes('localhost')) {
      console.log('📍 Trying Cloud MongoDB...')
      try {
        await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 })
        connected = true
        console.log('✅ Connected to Cloud MongoDB')
      } catch (error) {
        console.log('⚠️  Cloud MongoDB unavailable, trying local...')
      }
    }
    
    if (!connected) {
      mongoURI = 'mongodb://localhost:27017/cinemaflix'
      console.log('📍 Connecting to Local MongoDB...')
      await mongoose.connect(mongoURI)
      console.log('✅ Connected to Local MongoDB')
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'devtechs842@gmail.com' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Current Role:', existingAdmin.role)
      
      // Update password AND role to admin
      existingAdmin.password = 'pass123'
      existingAdmin.role = 'admin'
      existingAdmin.isActive = true
      await existingAdmin.save()
      console.log('✅ Admin password updated to: pass123')
      console.log('✅ Role updated to: admin')
    } else {
      // Create new admin user
      const admin = await User.create({
        name: 'DevTechs Admin',
        email: 'devtechs842@gmail.com',
        password: 'pass123',
        role: 'admin',
        isActive: true,
      })

      console.log('✅ Admin user created successfully!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:', admin.email)
      console.log('🔑 Password: pass123')
      console.log('👤 Role:', admin.role)
      console.log('🆔 ID:', admin._id)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }

    console.log('\n🎉 You can now login with:')
    console.log('   Email: devtechs842@gmail.com')
    console.log('   Password: pass123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
