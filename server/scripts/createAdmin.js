import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'devtechs842@gmail.com' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Role:', existingAdmin.role)
      
      // Update password if needed
      existingAdmin.password = 'pass123'
      await existingAdmin.save()
      console.log('✅ Admin password updated to: pass123')
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
