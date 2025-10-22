import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Movie from '../models/Movie.js'
import User from '../models/User.js'
import tmdbService from '../services/tmdbService.js'

dotenv.config()

const seedMovies = async () => {
  try {
    console.log('🎬 Starting to fetch movies from TMDB...')

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get or create admin user
    let admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      console.log('⚠️  No admin user found. Creating default admin...')
      admin = await User.create({
        name: 'Admin',
        email: 'admin@cinemaflix.com',
        password: 'admin123',
        role: 'admin',
      })
      console.log('✅ Admin user created: admin@cinemaflix.com / admin123')
    }

    // Clear existing movies (optional)
    const clearExisting = process.argv.includes('--clear')
    if (clearExisting) {
      await Movie.deleteMany({})
      console.log('🗑️  Cleared existing movies')
    }

    // Fetch movies from different categories
    console.log('📥 Fetching movies from TMDB...')

    const [popular, topRated, nowPlaying, trending] = await Promise.all([
      tmdbService.getPopularMovies(1),
      tmdbService.getTopRatedMovies(1),
      tmdbService.getNowPlayingMovies(1),
      tmdbService.getTrendingMovies('week'),
    ])

    // Combine and deduplicate movies
    const allMovies = [...popular, ...topRated, ...nowPlaying, ...trending]
    const uniqueMovies = allMovies.filter(
      (movie, index, self) => index === self.findIndex((m) => m.tmdbId === movie.tmdbId)
    )

    console.log(`📊 Found ${uniqueMovies.length} unique movies`)

    // Fetch detailed information for each movie
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < uniqueMovies.length; i++) {
      try {
        console.log(`⏳ Processing movie ${i + 1}/${uniqueMovies.length}...`)

        const movieDetails = await tmdbService.getMovieById(uniqueMovies[i].tmdbId)

        // Check if movie already exists
        const existingMovie = await Movie.findOne({ title: movieDetails.title })
        if (existingMovie && !clearExisting) {
          console.log(`⏭️  Skipped: ${movieDetails.title} (already exists)`)
          continue
        }

        // Create movie
        await Movie.create({
          ...movieDetails,
          addedBy: admin._id,
        })

        successCount++
        console.log(`✅ Added: ${movieDetails.title}`)

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 250))
      } catch (error) {
        errorCount++
        console.error(`❌ Error processing movie: ${error.message}`)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully added: ${successCount} movies`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('🎉 Movie seeding completed!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeder
seedMovies()
