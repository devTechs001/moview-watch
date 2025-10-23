import { useState, useEffect } from 'react'
import { Film } from 'lucide-react'
import Layout from '../components/Layout'
import MovieCard from '../components/MovieCard'
import axios from '../lib/axios'

const MoviesPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('All')

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation']

  useEffect(() => {
    fetchMovies()
  }, [selectedGenre])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const params = selectedGenre !== 'All' ? { genre: selectedGenre } : {}
      const response = await axios.get('/movies', { params })
      setMovies(response.data.movies || [])
    } catch (error) {
      setMovies(generateDemoMovies())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMovies = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      _id: i + 1,
      title: `Movie ${i + 1}`,
      poster: `https://picsum.photos/seed/movie${i}/300/450`,
      year: 2020 + (i % 5),
      genre: [selectedGenre !== 'All' ? selectedGenre : genres[1 + (i % 8)]],
      rating: 6 + Math.random() * 4,
      likes: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
    }))
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Film className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">All Movies</h1>
        </div>

        {/* Genre Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MoviesPage
