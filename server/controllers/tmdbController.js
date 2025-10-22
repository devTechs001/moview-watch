import tmdbService from '../services/tmdbService.js'
import Movie from '../models/Movie.js'

// @desc    Fetch and save popular movies from TMDB
// @route   POST /api/admin/tmdb/fetch-popular
// @access  Private/Admin
export const fetchPopularMovies = async (req, res) => {
  try {
    const { page = 1, save = true } = req.body

    const movies = await tmdbService.getPopularMovies(page)

    if (save) {
      let savedCount = 0
      for (const movieData of movies) {
        const movieDetails = await tmdbService.getMovieById(movieData.tmdbId)
        
        const existingMovie = await Movie.findOne({ title: movieDetails.title })
        if (!existingMovie) {
          await Movie.create({
            ...movieDetails,
            addedBy: req.user._id,
          })
          savedCount++
        }
      }

      res.json({
        message: `Fetched ${movies.length} movies, saved ${savedCount} new movies`,
        movies,
        savedCount,
      })
    } else {
      res.json({ movies, count: movies.length })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Fetch and save trending movies from TMDB
// @route   POST /api/admin/tmdb/fetch-trending
// @access  Private/Admin
export const fetchTrendingMovies = async (req, res) => {
  try {
    const { timeWindow = 'week', save = true } = req.body

    const movies = await tmdbService.getTrendingMovies(timeWindow)

    if (save) {
      let savedCount = 0
      for (const movieData of movies) {
        const movieDetails = await tmdbService.getMovieById(movieData.tmdbId)
        
        const existingMovie = await Movie.findOne({ title: movieDetails.title })
        if (!existingMovie) {
          await Movie.create({
            ...movieDetails,
            addedBy: req.user._id,
          })
          savedCount++
        }
      }

      res.json({
        message: `Fetched ${movies.length} trending movies, saved ${savedCount} new movies`,
        movies,
        savedCount,
      })
    } else {
      res.json({ movies, count: movies.length })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Search movies on TMDB
// @route   GET /api/admin/tmdb/search
// @access  Private/Admin
export const searchTMDB = async (req, res) => {
  try {
    const { query, page = 1 } = req.query

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' })
    }

    const movies = await tmdbService.searchMovies(query, page)

    res.json({ movies, count: movies.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get TMDB movie details and save
// @route   POST /api/admin/tmdb/import/:tmdbId
// @access  Private/Admin
export const importMovieFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.params

    const movieDetails = await tmdbService.getMovieById(tmdbId)

    const existingMovie = await Movie.findOne({ title: movieDetails.title })
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie already exists in database' })
    }

    const movie = await Movie.create({
      ...movieDetails,
      addedBy: req.user._id,
    })

    res.status(201).json({ message: 'Movie imported successfully', movie })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get available genres from TMDB
// @route   GET /api/admin/tmdb/genres
// @access  Private/Admin
export const getGenres = async (req, res) => {
  try {
    const genres = await tmdbService.getGenres()
    res.json({ genres })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
