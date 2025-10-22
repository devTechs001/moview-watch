import axios from 'axios'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

class TMDBService {
  constructor() {
    this.api = axios.create({
      baseURL: TMDB_BASE_URL,
      params: {
        api_key: TMDB_API_KEY,
      },
    })
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/popular', {
        params: { page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching popular movies:', error.message)
      throw error
    }
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = 'week') {
    try {
      const response = await this.api.get(`/trending/movie/${timeWindow}`)
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching trending movies:', error.message)
      throw error
    }
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/top_rated', {
        params: { page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching top rated movies:', error.message)
      throw error
    }
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/now_playing', {
        params: { page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching now playing movies:', error.message)
      throw error
    }
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/upcoming', {
        params: { page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching upcoming movies:', error.message)
      throw error
    }
  }

  // Get movie by ID with full details
  async getMovieById(tmdbId) {
    try {
      const [movie, credits, videos] = await Promise.all([
        this.api.get(`/movie/${tmdbId}`),
        this.api.get(`/movie/${tmdbId}/credits`),
        this.api.get(`/movie/${tmdbId}/videos`),
      ])

      return this.formatMovieDetails(movie.data, credits.data, videos.data)
    } catch (error) {
      console.error('Error fetching movie details:', error.message)
      throw error
    }
  }

  // Search movies
  async searchMovies(query, page = 1) {
    try {
      const response = await this.api.get('/search/movie', {
        params: { query, page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error searching movies:', error.message)
      throw error
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await this.api.get('/discover/movie', {
        params: { with_genres: genreId, page },
      })
      return this.formatMovies(response.data.results)
    } catch (error) {
      console.error('Error fetching movies by genre:', error.message)
      throw error
    }
  }

  // Get all genres
  async getGenres() {
    try {
      const response = await this.api.get('/genre/movie/list')
      return response.data.genres
    } catch (error) {
      console.error('Error fetching genres:', error.message)
      throw error
    }
  }

  // Format movies data
  formatMovies(movies) {
    return movies.map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      description: movie.overview,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      rating: movie.vote_average,
      ratingCount: movie.vote_count,
      popularity: movie.popularity,
      genreIds: movie.genre_ids,
    }))
  }

  // Format movie details
  formatMovieDetails(movie, credits, videos) {
    const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
    const director = credits.crew.find((person) => person.job === 'Director')
    const cast = credits.cast.slice(0, 10).map((actor) => actor.name)

    return {
      tmdbId: movie.id,
      title: movie.title,
      description: movie.overview,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      videoUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      duration: movie.runtime,
      genre: movie.genres.map((g) => g.name),
      director: director ? director.name : 'Unknown',
      cast,
      rating: movie.vote_average,
      ratingCount: movie.vote_count,
      popularity: movie.popularity,
      status: 'active',
      featured: movie.popularity > 100,
    }
  }

  // Get image URL
  getImageUrl(path, size = 'w500') {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }
}

export default new TMDBService()
