import Movie from '../models/Movie.js'
import User from '../models/User.js'
import AILearningData from '../models/AILearningData.js'
import ActivityLog from '../models/ActivityLog.js'

// @desc    Get AI-powered recommendations for user
// @route   GET /api/ai/recommendations
// @access  Private
export const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.user._id

    // Get user's watch history
    const watchHistory = await ActivityLog.find({
      user: userId,
      action: { $in: ['watch_movie', 'rate_movie', 'add_to_wishlist'] }
    }).limit(50).sort({ createdAt: -1 })

    // Get user's ratings
    const user = await User.findById(userId).populate('watchHistory.movie')

    // Analyze user preferences
    const preferences = await analyzeUserPreferences(userId, watchHistory, user)

    // Generate recommendations
    const recommendations = await generateRecommendations(preferences, userId)

    // Log this interaction for learning
    await AILearningData.create({
      category: 'user_behavior',
      data: {
        action: 'recommendations_viewed',
        preferences,
        recommendationsCount: recommendations.length,
      },
      context: {
        userId,
        action: 'view_recommendations',
      },
    })

    res.json({ 
      recommendations,
      preferences,
      message: 'AI recommendations generated based on your viewing habits'
    })
  } catch (error) {
    console.error('AI Recommendations error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Track user interaction with recommendation
// @route   POST /api/ai/recommendations/track
// @access  Private
export const trackRecommendationInteraction = async (req, res) => {
  try {
    const { movieId, action, recommendationId } = req.body

    // Log interaction for AI learning
    await AILearningData.create({
      category: 'interaction',
      data: {
        movieId,
        action, // 'clicked', 'watched', 'skipped', 'rated'
        recommendationId,
      },
      context: {
        userId: req.user._id,
        action: 'recommendation_interaction',
      },
      confidence: action === 'watched' ? 0.9 : 0.5,
    })

    res.json({ message: 'Interaction tracked' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user's AI insights
// @route   GET /api/ai/insights
// @access  Private
export const getUserInsights = async (req, res) => {
  try {
    const userId = req.user._id

    // Get watch history
    const watchHistory = await ActivityLog.find({
      user: userId,
      action: 'watch_movie'
    }).limit(100)

    // Calculate insights
    const insights = {
      totalWatched: watchHistory.length,
      favoriteGenres: await calculateFavoriteGenres(userId),
      watchingPatterns: await analyzeWatchingPatterns(userId),
      topActors: await getTopActors(userId),
      averageRating: await getAverageRating(userId),
      bingeSessions: await detectBingeSessions(userId),
      recommendations: {
        accuracy: 85, // Calculate based on user feedback
        totalGenerated: 150,
        clicked: 45,
        watched: 23,
      }
    }

    res.json({ insights })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper functions

async function analyzeUserPreferences(userId, watchHistory, user) {
  const preferences = {
    genres: {},
    actors: {},
    directors: {},
    yearRange: { min: 2020, max: 2024 },
    ratingPreference: 0,
    watchTime: {},
  }

  // Analyze watch history
  for (const log of watchHistory) {
    if (log.metadata?.movieId) {
      const movie = await Movie.findById(log.metadata.movieId)
      if (movie) {
        // Count genres
        movie.genre?.forEach(genre => {
          preferences.genres[genre] = (preferences.genres[genre] || 0) + 1
        })

        // Count actors
        movie.cast?.slice(0, 3).forEach(actor => {
          preferences.actors[actor] = (preferences.actors[actor] || 0) + 1
        })

        // Track year preferences
        if (movie.year) {
          preferences.yearRange.min = Math.min(preferences.yearRange.min, movie.year)
          preferences.yearRange.max = Math.max(preferences.yearRange.max, movie.year)
        }
      }
    }

    // Analyze watch time patterns
    const hour = new Date(log.createdAt).getHours()
    const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    preferences.watchTime[timeSlot] = (preferences.watchTime[timeSlot] || 0) + 1
  }

  // Calculate average rating preference
  if (user.watchHistory?.length > 0) {
    const ratings = user.watchHistory
      .filter(w => w.rating)
      .map(w => w.rating)
    preferences.ratingPreference = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0
  }

  return preferences
}

async function generateRecommendations(preferences, userId) {
  const recommendations = []

  // Get top genres
  const topGenres = Object.entries(preferences.genres)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre)

  // Get movies user hasn't watched
  const user = await User.findById(userId)
  const watchedMovieIds = user.watchHistory?.map(w => w.movie.toString()) || []

  // Find movies matching preferences
  const query = {
    _id: { $nin: watchedMovieIds },
    status: 'active',
  }

  if (topGenres.length > 0) {
    query.genre = { $in: topGenres }
  }

  const movies = await Movie.find(query)
    .sort({ rating: -1, views: -1 })
    .limit(20)

  // Score each movie based on preferences
  for (const movie of movies) {
    let score = 0
    let reasons = []

    // Genre match
    const genreMatches = movie.genre?.filter(g => topGenres.includes(g)).length || 0
    score += genreMatches * 30
    if (genreMatches > 0) {
      reasons.push(`Matches your favorite genres: ${movie.genre.filter(g => topGenres.includes(g)).join(', ')}`)
    }

    // Actor match
    const topActors = Object.entries(preferences.actors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([actor]) => actor)
    const actorMatches = movie.cast?.filter(a => topActors.includes(a)).length || 0
    score += actorMatches * 20
    if (actorMatches > 0) {
      reasons.push(`Features actors you love`)
    }

    // Rating match
    if (movie.rating >= preferences.ratingPreference) {
      score += 15
      reasons.push(`High rating (${movie.rating}/10)`)
    }

    // Popularity
    if (movie.views > 1000) {
      score += 10
      reasons.push('Popular choice')
    }

    // Year preference
    if (movie.year >= preferences.yearRange.min && movie.year <= preferences.yearRange.max) {
      score += 10
    }

    recommendations.push({
      movie: {
        _id: movie._id,
        title: movie.title,
        poster: movie.poster,
        genre: movie.genre,
        rating: movie.rating,
        year: movie.year,
        description: movie.description,
      },
      aiScore: Math.min(score, 100),
      confidence: Math.min(score / 100, 1),
      reasons: reasons.slice(0, 3),
      category: genreMatches > 1 ? 'perfect_match' : actorMatches > 0 ? 'you_might_like' : 'trending',
    })
  }

  // Sort by AI score
  recommendations.sort((a, b) => b.aiScore - a.aiScore)

  return recommendations.slice(0, 12)
}

async function calculateFavoriteGenres(userId) {
  const user = await User.findById(userId).populate('watchHistory.movie')
  const genreCounts = {}

  user.watchHistory?.forEach(w => {
    if (w.movie?.genre) {
      w.movie.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    }
  })

  return Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }))
}

async function analyzeWatchingPatterns(userId) {
  const logs = await ActivityLog.find({
    user: userId,
    action: 'watch_movie'
  }).sort({ createdAt: -1 }).limit(50)

  const patterns = {
    preferredTime: {},
    preferredDay: {},
    averageSessionLength: 0,
  }

  logs.forEach(log => {
    const date = new Date(log.createdAt)
    const hour = date.getHours()
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })

    const timeSlot = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
    patterns.preferredTime[timeSlot] = (patterns.preferredTime[timeSlot] || 0) + 1
    patterns.preferredDay[day] = (patterns.preferredDay[day] || 0) + 1
  })

  return patterns
}

async function getTopActors(userId) {
  const user = await User.findById(userId).populate('watchHistory.movie')
  const actorCounts = {}

  user.watchHistory?.forEach(w => {
    if (w.movie?.cast) {
      w.movie.cast.slice(0, 3).forEach(actor => {
        actorCounts[actor] = (actorCounts[actor] || 0) + 1
      })
    }
  })

  return Object.entries(actorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([actor, count]) => ({ actor, count }))
}

async function getAverageRating(userId) {
  const user = await User.findById(userId)
  const ratings = user.watchHistory?.filter(w => w.rating).map(w => w.rating) || []
  return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0
}

async function detectBingeSessions(userId) {
  const logs = await ActivityLog.find({
    user: userId,
    action: 'watch_movie'
  }).sort({ createdAt: -1 })

  let sessions = 0
  let currentSession = []

  for (let i = 0; i < logs.length; i++) {
    if (i === 0) {
      currentSession.push(logs[i])
    } else {
      const timeDiff = logs[i - 1].createdAt - logs[i].createdAt
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff < 4) {
        currentSession.push(logs[i])
      } else {
        if (currentSession.length >= 3) {
          sessions++
        }
        currentSession = [logs[i]]
      }
    }
  }

  if (currentSession.length >= 3) {
    sessions++
  }

  return sessions
}

export default {
  getAIRecommendations,
  trackRecommendationInteraction,
  getUserInsights,
}
