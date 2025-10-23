import express from 'express'
import seedMovies from '../utils/seedMovies.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Seed movies (development only)
router.post('/seed-movies', protect, adminOnly, async (req, res) => {
  try {
    await seedMovies()
    res.json({ message: 'Movies seeded successfully' })
  } catch (error) {
    console.error('Error seeding movies:', error)
    res.status(500).json({ message: 'Error seeding movies' })
  }
})

export default router
