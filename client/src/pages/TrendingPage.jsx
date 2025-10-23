import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import MovieCard from '../components/MovieCard'
import axios from '../lib/axios'

const TrendingPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await axios.get('/movies', { params: { sort: 'views' } })
      setMovies(response.data.movies || [])
    } catch (error) {
      // Demo data
      setMovies(generateDemoMovies())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMovies = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: i + 1,
      title: `Trending Movie ${i + 1}`,
      poster: `https://picsum.photos/seed/trending${i}/300/450`,
      year: 2024,
      genre: ['Action', 'Thriller'],
      rating: 7 + Math.random() * 3,
      likes: Math.floor(Math.random() * 50000),
      views: Math.floor(Math.random() * 500000) + 100000,
    }))
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Trending Now</h1>
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

export default TrendingPage
