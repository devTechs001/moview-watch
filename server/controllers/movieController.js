import Movie from '../models/Movie.js'
import Rating from '../models/Rating.js'

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res) => {
  try {
    const { genre, year, search, page = 1, limit = 20 } = req.query

    const query = { status: 'active' }

    if (genre) {
      query.genre = genre
    }

    if (year) {
      query.year = parseInt(year)
    }

    if (search) {
      query.$text = { $search: search }
    }

    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('addedBy', 'name')

    const count = await Movie.countDocuments(query)

    res.json({
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
export const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('addedBy', 'name')

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    // Increment views
    movie.views += 1
    await movie.save()

    res.json({ movie })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create({
      ...req.body,
      addedBy: req.user._id,
    })

    res.status(201).json({ movie })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json({ movie: updatedMovie })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    await movie.deleteOne()

    res.json({ message: 'Movie removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like/Unlike movie
// @route   PUT /api/movies/:id/like
// @access  Private
export const likeMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    movie.likes += 1
    await movie.save()

    res.json({ likes: movie.likes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Rate movie
// @route   POST /api/movies/:id/rate
// @access  Private
export const rateMovie = async (req, res) => {
  try {
    const { rating } = req.body
    const movieId = req.params.id

    // Create or update rating
    const existingRating = await Rating.findOne({
      movie: movieId,
      user: req.user._id,
    })

    if (existingRating) {
      existingRating.rating = rating
      await existingRating.save()
    } else {
      await Rating.create({
        movie: movieId,
        user: req.user._id,
        rating,
      })
    }

    // Update movie average rating
    const ratings = await Rating.find({ movie: movieId })
    const avgRating = ratings.reduce((acc, item) => item.rating + acc, 0) / ratings.length

    const movie = await Movie.findById(movieId)
    movie.rating = avgRating
    movie.ratingCount = ratings.length
    await movie.save()

    res.json({ rating: avgRating, ratingCount: ratings.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
