import axios from 'axios'
import Movie from '../models/Movie.js'

// API Keys - should be in .env
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your_tmdb_key'
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'your_omdb_key'

// @desc    Import movie from TMDB
// @route   POST /api/movies/import/tmdb
// @access  Private/Admin
export const importFromTMDB = async (req, res) => {
  try {
    const { tmdbId } = req.body

    // Fetch movie details from TMDB
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    )

    const tmdbMovie = response.data

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ 'externalId.tmdb': tmdbId })
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie already exists in database' })
    }

    // Get trailer
    const trailer = tmdbMovie.videos?.results?.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    )

    // Create movie
    const movie = await Movie.create({
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
      videoUrl: '', // Will need to be added manually or from another source
      year: new Date(tmdbMovie.release_date).getFullYear(),
      duration: tmdbMovie.runtime,
      genre: tmdbMovie.genres.map((g) => g.name),
      director: tmdbMovie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
      cast: tmdbMovie.credits?.cast?.slice(0, 10).map((c) => c.name) || [],
      rating: tmdbMovie.vote_average,
      ratingCount: tmdbMovie.vote_count,
      source: 'tmdb',
      externalId: {
        tmdb: tmdbId,
        imdb: tmdbMovie.imdb_id,
      },
      addedBy: req.user._id,
    })

    res.status(201).json({ movie, message: 'Movie imported from TMDB successfully' })
  } catch (error) {
    console.error('TMDB import error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Import movie from OMDB
// @route   POST /api/movies/import/omdb
// @access  Private/Admin
export const importFromOMDB = async (req, res) => {
  try {
    const { imdbId } = req.body

    // Fetch movie details from OMDB
    const response = await axios.get(
      `http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}&plot=full`
    )

    const omdbMovie = response.data

    if (omdbMovie.Response === 'False') {
      return res.status(404).json({ message: 'Movie not found on OMDB' })
    }

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ 'externalId.imdb': imdbId })
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie already exists in database' })
    }

    // Parse duration (e.g., "142 min" -> 142)
    const duration = parseInt(omdbMovie.Runtime?.replace(' min', '')) || 0

    // Create movie
    const movie = await Movie.create({
      title: omdbMovie.Title,
      description: omdbMovie.Plot,
      poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '',
      backdrop: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '',
      trailer: '',
      videoUrl: '', // Will need to be added manually
      year: parseInt(omdbMovie.Year),
      duration,
      genre: omdbMovie.Genre?.split(', ') || [],
      director: omdbMovie.Director !== 'N/A' ? omdbMovie.Director : 'Unknown',
      cast: omdbMovie.Actors?.split(', ') || [],
      rating: parseFloat(omdbMovie.imdbRating) || 0,
      ratingCount: parseInt(omdbMovie.imdbVotes?.replace(/,/g, '')) || 0,
      source: 'omdb',
      externalId: {
        imdb: imdbId,
        omdb: imdbId,
      },
      addedBy: req.user._id,
    })

    res.status(201).json({ movie, message: 'Movie imported from OMDB successfully' })
  } catch (error) {
    console.error('OMDB import error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Search movies from TMDB
// @route   GET /api/movies/import/tmdb/search
// @access  Private/Admin
export const searchTMDB = async (req, res) => {
  try {
    const { query, page = 1 } = req.query

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )

    const results = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
    }))

    res.json({
      results,
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
    })
  } catch (error) {
    console.error('TMDB search error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Search movies from OMDB
// @route   GET /api/movies/import/omdb/search
// @access  Private/Admin
export const searchOMDB = async (req, res) => {
  try {
    const { query, page = 1 } = req.query

    const response = await axios.get(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}&page=${page}`
    )

    if (response.data.Response === 'False') {
      return res.json({ results: [], totalResults: 0 })
    }

    const results = response.data.Search.map((movie) => ({
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster !== 'N/A' ? movie.Poster : null,
      type: movie.Type,
    }))

    res.json({
      results,
      totalResults: parseInt(response.data.totalResults),
    })
  } catch (error) {
    console.error('OMDB search error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Bulk import movies from TMDB
// @route   POST /api/movies/import/tmdb/bulk
// @access  Private/Admin
export const bulkImportFromTMDB = async (req, res) => {
  try {
    const { tmdbIds } = req.body // Array of TMDB IDs

    if (!Array.isArray(tmdbIds) || tmdbIds.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of TMDB IDs' })
    }

    const results = {
      success: [],
      failed: [],
      skipped: [],
    }

    for (const tmdbId of tmdbIds) {
      try {
        // Check if already exists
        const existingMovie = await Movie.findOne({ 'externalId.tmdb': tmdbId })
        if (existingMovie) {
          results.skipped.push({ tmdbId, reason: 'Already exists' })
          continue
        }

        // Fetch and create movie
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
        )

        const tmdbMovie = response.data

        const trailer = tmdbMovie.videos?.results?.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        )

        const movie = await Movie.create({
          title: tmdbMovie.title,
          description: tmdbMovie.overview,
          poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`,
          trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
          videoUrl: '', // Placeholder
          year: new Date(tmdbMovie.release_date).getFullYear(),
          duration: tmdbMovie.runtime,
          genre: tmdbMovie.genres.map((g) => g.name),
          director: tmdbMovie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
          cast: tmdbMovie.credits?.cast?.slice(0, 10).map((c) => c.name) || [],
          rating: tmdbMovie.vote_average,
          ratingCount: tmdbMovie.vote_count,
          source: 'tmdb',
          externalId: {
            tmdb: tmdbId,
            imdb: tmdbMovie.imdb_id,
          },
          addedBy: req.user._id,
        })

        results.success.push({ tmdbId, movieId: movie._id, title: movie.title })

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 250))
      } catch (error) {
        results.failed.push({ tmdbId, error: error.message })
      }
    }

    res.json({
      message: 'Bulk import completed',
      results,
      summary: {
        total: tmdbIds.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get popular movies from TMDB
// @route   GET /api/movies/import/tmdb/popular
// @access  Private/Admin
export const getTMDBPopular = async (req, res) => {
  try {
    const { page = 1 } = req.query

    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
    )

    const results = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
      popularity: movie.popularity,
    }))

    res.json({
      results,
      page: response.data.page,
      totalPages: response.data.total_pages,
    })
  } catch (error) {
    console.error('TMDB popular error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get trending movies from TMDB
// @route   GET /api/movies/import/tmdb/trending
// @access  Private/Admin
export const getTMDBTrending = async (req, res) => {
  try {
    const { timeWindow = 'week' } = req.query // day or week

    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
    )

    const results = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
      popularity: movie.popularity,
    }))

    res.json({ results })
  } catch (error) {
    console.error('TMDB trending error:', error)
    res.status(500).json({ message: error.message })
  }
}
